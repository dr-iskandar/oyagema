'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiRepeat, FiShuffle, FiVolume2, FiHeart, FiMusic } from 'react-icons/fi';
import { useAudioPlayer } from '@/lib/contexts/AudioPlayerContext';
import { useToggleFavorite, useIsFavorite } from '@/lib/hooks/useFavorites';
import { useAuth } from '@/lib/hooks/useAuth';

const MusicPlayer = () => {
  const { user } = useAuth();
  const {
    currentTrack,
    isPlaying,
    duration,
    currentTime,
    volume,
    togglePlay,
    seekTo,
    setVolume,
    formatTime,
    nextTrack,
    prevTrack,
    canGoNext,
    canGoPrev,
    shuffleHistory,
    isShuffled,
    repeatMode,
    toggleRepeat,
  } = useAudioPlayer();

  const userId = user?.id || '';

  const { isFavorite, loading: favoriteLoading } = useIsFavorite(userId, currentTrack?.id || '');
  const { toggleFavorite, loading: toggleLoading } = useToggleFavorite(userId);

  const [isLoading, setIsLoading] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  useEffect(() => {
    if (currentTrack) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentTrack]);

  const handleSeekStart = () => {
    if (!duration || duration <= 0) return;
    setIsSeeking(true);
    setSeekValue(currentTime);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!duration || duration <= 0) return;
    const newValue = parseFloat(e.target.value);
    setSeekValue(newValue);
  };

  const handleSeekEnd = () => {
    if (!duration || duration <= 0) return;
    setIsSeeking(false);
    if (isFinite(seekValue) && seekValue >= 0) {
      seekTo(seekValue);
    }
  };

  const handleToggleFavorite = async () => {
    if (currentTrack?.id && !toggleLoading) {
      await toggleFavorite(currentTrack.id, isFavorite);
    }
  };

  const displayTime = isSeeking ? seekValue : (currentTime || 0);
  const progressValue = isSeeking ? seekValue : (currentTime || 0);

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-background-dark/95 to-background/95 backdrop-blur-lg border-t border-primary/20 z-50 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        {!currentTrack ? (
          // Empty State
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-background-light rounded-lg flex items-center justify-center">
                <FiMusic className="text-text-secondary text-xl" />
              </div>
              <div>
                <p className="text-text-primary font-medium">No track selected</p>
                <p className="text-text-secondary text-sm">Choose a track to start listening</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full bg-background-light/50 text-text-muted cursor-not-allowed" disabled>
                <FiSkipBack size={18} />
              </button>
              <button className="p-3 rounded-full bg-background-light/50 text-text-muted cursor-not-allowed" disabled>
                <FiPlay size={20} />
              </button>
              <button className="p-2 rounded-full bg-background-light/50 text-text-muted cursor-not-allowed" disabled>
                <FiSkipForward size={18} />
              </button>
            </div>
          </div>
        ) : (
          // Active Player
          <>
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between">
              {/* Track Info */}
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg">
                  <Image 
                    src={currentTrack.coverUrl} 
                    alt={currentTrack.title} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-text-primary font-semibold truncate text-lg">{currentTrack.title}</h4>
                  <p className="text-text-secondary text-sm truncate">{currentTrack.artist}</p>
                </div>
                <button 
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading || toggleLoading}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isFavorite 
                      ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' 
                      : 'text-text-muted hover:text-red-500 hover:bg-red-500/10'
                  } ${(favoriteLoading || toggleLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiHeart className={isFavorite ? 'fill-current' : ''} size={18} />
                </button>
              </div>

              {/* Center Controls */}
              <div className="flex flex-col items-center space-y-3 flex-1 max-w-md mx-8">
                {/* Control Buttons */}
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={shuffleHistory}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isShuffled 
                        ? 'text-primary bg-primary/10 hover:bg-primary/20' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-light/50'
                    }`}
                  >
                    <FiShuffle size={18} />
                  </button>
                  <button 
                    onClick={prevTrack}
                    disabled={!canGoPrev}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      canGoPrev 
                        ? 'text-text-secondary hover:text-text-primary hover:bg-background-light/50' 
                        : 'text-text-muted cursor-not-allowed opacity-50'
                    }`}
                  >
                    <FiSkipBack size={20} />
                  </button>
                  <button 
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="p-4 rounded-full bg-primary hover:bg-primary-dark text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : isPlaying ? (
                      <FiPause size={24} />
                    ) : (
                      <FiPlay size={24} className="ml-0.5" />
                    )}
                  </button>
                  <button 
                    onClick={nextTrack}
                    disabled={!canGoNext}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      canGoNext 
                        ? 'text-text-secondary hover:text-text-primary hover:bg-background-light/50' 
                        : 'text-text-muted cursor-not-allowed opacity-50'
                    }`}
                  >
                    <FiSkipForward size={20} />
                  </button>
                  <button 
                    onClick={toggleRepeat}
                    className={`p-2 rounded-full transition-all duration-200 relative ${
                      repeatMode !== 'off'
                        ? 'text-primary bg-primary/10 hover:bg-primary/20' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-light/50'
                    }`}
                  >
                    <FiRepeat size={18} />
                    {repeatMode === 'one' && (
                      <span className="absolute -top-1 -right-1 text-xs font-bold text-primary bg-background rounded-full w-4 h-4 flex items-center justify-center">
                        1
                      </span>
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full flex items-center space-x-3">
                  <span className="text-text-muted text-xs font-mono min-w-[40px]">
                    {formatTime(displayTime)}
                  </span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      step="0.1"
                      value={progressValue}
                      onChange={handleSeekChange}
                      onMouseDown={handleSeekStart}
                      onMouseUp={handleSeekEnd}
                      onTouchStart={handleSeekStart}
                      onTouchEnd={handleSeekEnd}
                      className="w-full h-2 bg-background-light rounded-full appearance-none cursor-pointer progress-slider"
                      disabled={!duration || duration <= 0}
                    />
                  </div>
                  <span className="text-text-muted text-xs font-mono min-w-[40px]">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-3 flex-1 justify-end">
                <FiVolume2 className="text-text-secondary" size={18} />
                <div className="w-24">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-background-light rounded-full appearance-none cursor-pointer volume-slider"
                  />
                </div>
              </div>
            </div>
            
            {/* Mobile Layout */}
            <div className="md:hidden">
              {/* Progress Bar */}
              <div className="w-full mb-3">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={progressValue}
                  onChange={handleSeekChange}
                  onMouseDown={handleSeekStart}
                  onMouseUp={handleSeekEnd}
                  onTouchStart={handleSeekStart}
                  onTouchEnd={handleSeekEnd}
                  className="w-full h-1 bg-background-light rounded-full appearance-none cursor-pointer progress-slider-mobile"
                  disabled={!duration || duration <= 0}
                />
              </div>
              
              {/* Main Controls */}
              <div className="flex items-center justify-between">
                {/* Track Info */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                    <Image 
                      src={currentTrack.coverUrl} 
                      alt={currentTrack.title} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-text-primary font-medium truncate">{currentTrack.title}</h4>
                    <p className="text-text-secondary text-xs truncate">{currentTrack.artist}</p>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={prevTrack}
                    disabled={!canGoPrev}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      canGoPrev 
                        ? 'text-text-secondary hover:text-text-primary hover:bg-background-light/50' 
                        : 'text-text-muted cursor-not-allowed opacity-50'
                    }`}
                  >
                    <FiSkipBack size={16} />
                  </button>
                  <button 
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="p-3 rounded-full bg-primary hover:bg-primary-dark text-white transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : isPlaying ? (
                      <FiPause size={18} />
                    ) : (
                      <FiPlay size={18} className="ml-0.5" />
                    )}
                  </button>
                  <button 
                    onClick={nextTrack}
                    disabled={!canGoNext}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      canGoNext 
                        ? 'text-text-secondary hover:text-text-primary hover:bg-background-light/50' 
                        : 'text-text-muted cursor-not-allowed opacity-50'
                    }`}
                  >
                    <FiSkipForward size={16} />
                  </button>
                  <button 
                    onClick={toggleRepeat}
                    className={`p-2 rounded-full transition-all duration-200 relative ${
                      repeatMode !== 'off'
                        ? 'text-primary bg-primary/10' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-light/50'
                    }`}
                  >
                    <FiRepeat size={16} />
                    {repeatMode === 'one' && (
                      <span className="absolute -top-0.5 -right-0.5 text-xs font-bold text-primary bg-background rounded-full w-3 h-3 flex items-center justify-center">
                        1
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading || toggleLoading}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isFavorite 
                        ? 'text-red-500 bg-red-500/10' 
                        : 'text-text-muted hover:text-red-500 hover:bg-red-500/10'
                    } ${(favoriteLoading || toggleLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <FiHeart className={isFavorite ? 'fill-current' : ''} size={16} />
                  </button>
                </div>
              </div>
              
              {/* Time Display */}
              <div className="flex justify-between items-center mt-2 text-xs text-text-muted font-mono">
                <span>{formatTime(displayTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </>
        )}
      </div>
      
      <style jsx>{`
        /* Progress Slider Styles */
        .progress-slider {
          background: linear-gradient(to right, #8b5cf6 0%, #06b6d4 ${(progressValue / (duration || 1)) * 100}%, #374151 ${(progressValue / (duration || 1)) * 100}%, #374151 100%);
        }
        
        .progress-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #8b5cf6;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }
        
        .progress-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        
        .progress-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #8b5cf6;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        /* Mobile Progress Slider */
        .progress-slider-mobile {
          background: linear-gradient(to right, #8b5cf6 0%, #06b6d4 ${(progressValue / (duration || 1)) * 100}%, #374151 ${(progressValue / (duration || 1)) * 100}%, #374151 100%);
        }
        
        .progress-slider-mobile::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #8b5cf6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        
        .progress-slider-mobile::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #8b5cf6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        
        /* Volume Slider Styles */
        .volume-slider {
          background: linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%);
        }
        
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        /* Disabled state */
        .progress-slider:disabled,
        .progress-slider-mobile:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .progress-slider:disabled::-webkit-slider-thumb,
        .progress-slider-mobile:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
        }
      `}</style>
    </motion.div>
  );
};

export default MusicPlayer;