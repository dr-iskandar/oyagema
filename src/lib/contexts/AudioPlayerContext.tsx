'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAddToHistory, useHistory } from '../hooks/useHistory';
import { useAuth } from '../hooks/useAuth';

type Track = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
};

type RepeatMode = 'off' | 'one' | 'all';

type AudioPlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  formatTime: (timeInSeconds: number) => string;
  nextTrack: () => void;
  prevTrack: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  shuffleHistory: () => void;
  isShuffled: boolean;
  repeatMode: RepeatMode;
  toggleRepeat: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

type AudioPlayerProviderProps = {
  children: ReactNode;
};

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
  const { user } = useAuth();
  const userId = user?.id || '';
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Only use addToHistory if we have a valid userId
  const { addToHistory } = useAddToHistory(userId);
  const { history } = useHistory(userId);
  
  // Current track index in history
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledHistory, setShuffledHistory] = useState<typeof history>([]);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  useEffect(() => {
    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      // Ensure loop is disabled by default
      audioRef.current.loop = false;
    }

    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio element error:', e);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('error', handleError);
    };
  }, []);



  // Track the last track added to history to prevent duplicates
  const lastHistoryTrackRef = useRef<string | null>(null);

  // Update audio source when currentTrack changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      console.log('Track changed in useEffect:', currentTrack.title);
      
      // Add to history when track changes, but only if userId is valid and track is different
      if (userId && userId.trim() !== '' && currentTrack.id && 
          lastHistoryTrackRef.current !== currentTrack.id) {
        console.log('Adding track to history:', currentTrack.id);
        lastHistoryTrackRef.current = currentTrack.id;
        
        try {
          addToHistory(currentTrack.id)
            .catch(err => {
              // Reset the ref on error so we can retry
              lastHistoryTrackRef.current = null;
              console.error('Error adding to history, but continuing playback:', err);
            });
        } catch (err) {
          // Reset the ref on error so we can retry
          lastHistoryTrackRef.current = null;
          console.error('Error in addToHistory, but continuing playback:', err);
        }
      } else {
        // Skip history tracking for non-authenticated users or duplicate tracks
        console.debug('Skipping history tracking - no valid userId or duplicate track');
      }
    }
  }, [currentTrack, userId, addToHistory]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Track the current play promise to handle interruptions properly
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const playTrack = (track: Track) => {
    if (!track || !track.id) {
      console.error('Invalid track provided to playTrack');
      return;
    }
    
    console.log('playTrack called with track:', track.title);
    
    // Check if we're already playing this track
    if (currentTrack && currentTrack.id === track.id && isPlaying) {
      console.log('Already playing this track, no need to reload');
      return;
    }
    
    // Set playing state to true before attempting to play
    setIsPlaying(true);
    
    // Use callback form to ensure we're working with the latest state
    setCurrentTrack(track);
    
    // Force update audio element if it exists
    if (audioRef.current) {
      // Ensure loop is disabled - critical to prevent unwanted looping
      audioRef.current.loop = false;
      console.log('Loop disabled for track:', track.title);
      
      // Cancel any pending play operation properly
      if (playPromiseRef.current) {
        console.log('Existing play promise found, letting browser handle abort');
      }
      
      // Set the new source
      console.log('Setting audio source to:', track.audioUrl);
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
      
      // Store the new play promise
      console.log('Attempting to play audio');
      playPromiseRef.current = audioRef.current.play()
        .then(() => {
          // Play succeeded
          console.log('Play succeeded');
          playPromiseRef.current = null;
        })
        .catch(err => {
          playPromiseRef.current = null;
          // Only log AbortError at debug level since it's expected when changing tracks quickly
          if (err.name === 'AbortError') {
            console.debug('Play request was aborted, likely due to a new track selection');
          } else {
            console.error('Error playing audio from playTrack:', err);
            // If there was an error playing, update the UI state
            setIsPlaying(false);
          }
        });
    }
  };

  const togglePlay = () => {
    if (!currentTrack || !audioRef.current) {
      console.log('Cannot toggle play: no current track or audio element');
      return;
    }

    console.log('togglePlay called, current state:', isPlaying ? 'playing' : 'paused');

    if (isPlaying) {
      console.log('Pausing audio');
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Ensure loop is disabled before playing
      if (audioRef.current) {
        audioRef.current.loop = false;
        console.log('Loop disabled in togglePlay');
      }
      
      // Set playing state to true before attempting to play
      setIsPlaying(true);
      
      // Handle the play promise properly
      if (playPromiseRef.current) {
        console.log('Play operation already in progress, waiting for it to complete');
        // A play operation is already in progress, let it complete
        return;
      }
      
      console.log('Attempting to play audio in togglePlay');
      playPromiseRef.current = audioRef.current.play()
        .then(() => {
          console.log('Play succeeded in togglePlay');
          playPromiseRef.current = null;
        })
        .catch(err => {
          playPromiseRef.current = null;
          // Only log AbortError at debug level
          if (err.name === 'AbortError') {
            console.debug('Play request was aborted during toggle');
          } else {
            console.error('Error playing audio in togglePlay:', err);
            // Make sure to set isPlaying to false on error
            setIsPlaying(false);
          }
        });
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    // Handle invalid values
    if (!isFinite(timeInSeconds) || timeInSeconds < 0 || isNaN(timeInSeconds)) {
      return '0:00';
    }
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle track end with proper state access - moved after playTrack declaration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTrackEnd = () => {
      console.log('Track ended, repeat mode:', repeatMode);
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Handle repeat modes
      if (repeatMode === 'one') {
        // Repeat current track
        console.log('Repeating current track');
        if (currentTrack && audioRef.current) {
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              setCurrentTime(0);
              setIsPlaying(true);
              audioRef.current.play().catch(err => {
                console.error('Error replaying track:', err);
                setIsPlaying(false);
              });
            }
          }, 100);
        }
      } else if (repeatMode === 'all' || repeatMode === 'off') {
        // Play next track if available
        const currentHistory = isShuffled ? shuffledHistory : history;
        console.log('Current history index:', currentHistoryIndex, 'History length:', currentHistory.length);
        
        if (currentHistoryIndex >= 0 && currentHistoryIndex < currentHistory.length - 1) {
          const nextItem = currentHistory[currentHistoryIndex + 1];
          console.log('Playing next track:', nextItem?.track?.title);
          if (nextItem && nextItem.track) {
            setTimeout(() => {
              playTrack({
                id: nextItem.track.id,
                title: nextItem.track.title,
                artist: nextItem.track.artist,
                coverUrl: nextItem.track.coverUrl,
                audioUrl: nextItem.track.audioUrl,
                duration: nextItem.track.duration
              });
            }, 100);
          }
        } else if (repeatMode === 'all' && currentHistory.length > 0) {
          // If repeat all is enabled and we're at the end, start from beginning
          const firstItem = currentHistory[0];
          console.log('Repeat all - playing first track:', firstItem?.track?.title);
          if (firstItem && firstItem.track) {
            setTimeout(() => {
              playTrack({
                id: firstItem.track.id,
                title: firstItem.track.title,
                artist: firstItem.track.artist,
                coverUrl: firstItem.track.coverUrl,
                audioUrl: firstItem.track.audioUrl,
                duration: firstItem.track.duration
              });
            }, 100);
          }
        } else {
          console.log('No next track available, stopping playback');
        }
      }
    };

    audio.addEventListener('ended', handleTrackEnd);

    return () => {
      audio.removeEventListener('ended', handleTrackEnd);
    };
  }, [repeatMode, currentTrack, currentHistoryIndex, history, shuffledHistory, isShuffled, playTrack]);

  // Update shuffled history when history changes
  useEffect(() => {
    if (isShuffled && history.length > 0) {
      const shuffled = [...history].sort(() => Math.random() - 0.5);
      setShuffledHistory(shuffled);
    } else {
      setShuffledHistory(history);
    }
  }, [history, isShuffled]);

  // Update current history index when track changes
  useEffect(() => {
    const currentHistory = isShuffled ? shuffledHistory : history;
    if (currentTrack && currentHistory.length > 0) {
      const index = currentHistory.findIndex(item => item.track.id === currentTrack.id);
      setCurrentHistoryIndex(index);
    } else {
      setCurrentHistoryIndex(-1);
    }
  }, [currentTrack, history, shuffledHistory, isShuffled]);

  const nextTrack = () => {
    const currentHistory = isShuffled ? shuffledHistory : history;
    if (currentHistoryIndex >= 0 && currentHistoryIndex < currentHistory.length - 1) {
      const nextItem = currentHistory[currentHistoryIndex + 1];
      if (nextItem && nextItem.track) {
        playTrack({
          id: nextItem.track.id,
          title: nextItem.track.title,
          artist: nextItem.track.artist,
          coverUrl: nextItem.track.coverUrl,
          audioUrl: nextItem.track.audioUrl,
          duration: nextItem.track.duration
        });
      }
    }
  };

  const prevTrack = () => {
    const currentHistory = isShuffled ? shuffledHistory : history;
    if (currentHistoryIndex > 0) {
      const prevItem = currentHistory[currentHistoryIndex - 1];
      if (prevItem && prevItem.track) {
        playTrack({
          id: prevItem.track.id,
          title: prevItem.track.title,
          artist: prevItem.track.artist,
          coverUrl: prevItem.track.coverUrl,
          audioUrl: prevItem.track.audioUrl,
          duration: prevItem.track.duration
        });
      }
    }
  };

  const shuffleHistory = () => {
    setIsShuffled(!isShuffled);
    if (!isShuffled && history.length > 0) {
      // When enabling shuffle, create a new shuffled array
      const shuffled = [...history].sort(() => Math.random() - 0.5);
      setShuffledHistory(shuffled);
    }
  };

  const toggleRepeat = () => {
    setRepeatMode(current => {
      switch (current) {
        case 'off':
          return 'one';
        case 'one':
          return 'all';
        case 'all':
          return 'off';
        default:
          return 'off';
      }
    });
  };

  const currentHistory = isShuffled ? shuffledHistory : history;
  const canGoNext = currentHistoryIndex >= 0 && currentHistoryIndex < currentHistory.length - 1;
  const canGoPrev = currentHistoryIndex > 0;

  const value = {
    currentTrack,
    isPlaying,
    duration,
    currentTime,
    volume,
    playTrack,
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
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}