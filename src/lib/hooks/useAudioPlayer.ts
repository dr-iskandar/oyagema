import { useState, useEffect, useRef } from 'react';
import { useAddToHistory } from './useHistory';

type Track = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
};

export function useAudioPlayer(userId?: string) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Only use addToHistory if we have a valid userId
  const { addToHistory } = useAddToHistory(userId || '');
  


  useEffect(() => {
    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      // Ensure loop is disabled by default
      audioRef.current.loop = false;
    }
    
    // Make sure loop is always disabled
    if (audioRef.current) {
      audioRef.current.loop = false;
    }

    // Set up event listeners
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleDurationChange = () => {
      if (audio) {
        setDuration(audio.duration);
      }
    };

    const handleTrackEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.error('Audio element error:', e);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleTrackEnd);
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
        // We don't need to explicitly cancel - just let the promise handle itself
        // The browser will automatically abort the previous play request
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
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return {
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
  };
}