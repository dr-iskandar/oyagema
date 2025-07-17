'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiPlus, FiHeart, FiShare2, FiMusic } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';

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

export default function TrackPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const res = await fetch(`/api/tracks/${id}`);
        if (!res.ok) throw new Error('Failed to fetch track');
        const data = await res.json();
        setTrack(data);
        
        // Fetch related tracks from the same category
        if (data.categoryId) {
          const relatedRes = await fetch(`/api/categories/${data.category.slug}/tracks?limit=4`);
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            // Filter out the current track
            setRelatedTracks(relatedData.filter((t: Track) => t.id !== id));
          }
        }
      } catch (error) {
        console.error('Error fetching track:', error);
        setError('Failed to load track data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrack();
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    // Set up audio event listeners
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    // Set volume
    audio.volume = isMuted ? 0 : volume;

    // Cleanup
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [track, volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current || !track) return;
    
    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * track.duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    setIsMuted(!isMuted);
    audioRef.current.volume = !isMuted ? 0 : volume;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = isMuted ? 0 : newVolume;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAddToPlaylist = () => {
    // In a real app, this would open a dialog to add the track to a playlist
    console.log('Adding to playlist');
  };

  const handleLike = () => {
    // In a real app, this would add the track to favorites
    console.log('Liked track');
  };

  const handleShare = () => {
    // In a real app, this would open a share dialog
    console.log('Sharing track');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !track) {
    return (
      <MainLayout>
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-lg">
          {error || 'Track not found'}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Audio Element (hidden) */}
        <audio ref={audioRef} src={track.audioUrl} preload="metadata" />
        
        {/* Track Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 p-6">
            <div className="h-48 w-48 md:h-64 md:w-64 relative rounded-xl overflow-hidden shadow-xl">
              <Image
                src={track.coverUrl || '/images/track-cover-1.svg'}
                alt={track.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-text-primary">{track.title}</h1>
              <h2 className="text-2xl text-text-secondary mt-1">{track.artist}</h2>
              
              {track.description && (
                <p className="text-text-secondary mt-4 max-w-2xl">{track.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-2 mt-4 text-text-secondary">
                <Link 
                  href={`/categories/${track.category.slug}`}
                  className="px-3 py-1 bg-background-light/30 rounded-full text-sm hover:bg-background-light/50 transition-colors"
                >
                  {track.category.name}
                </Link>
                <span>•</span>
                <span>{formatTime(track.duration)}</span>
                <span>•</span>
                <span>Added {new Date(track.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-6">
                <button 
                  onClick={togglePlay}
                  className="btn-primary flex items-center gap-2"
                >
                  {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                
                <button 
                  onClick={handleAddToPlaylist}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiPlus size={18} />
                  <span>Add to Playlist</span>
                </button>
                
                <button 
                  onClick={handleLike}
                  className="btn-outline flex items-center gap-2"
                >
                  <FiHeart size={18} />
                  <span>Like</span>
                </button>
                
                <button 
                  onClick={handleShare}
                  className="btn-outline flex items-center gap-2"
                >
                  <FiShare2 size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Audio Player */}
        <div className="bg-background-light/10 rounded-xl p-4">
          <div className="flex flex-col space-y-2">
            {/* Progress Bar */}
            <div 
              ref={progressBarRef}
              className="h-2 bg-background-light/30 rounded-full cursor-pointer relative"
              onClick={handleProgressBarClick}
            >
              <div 
                className="absolute top-0 left-0 h-full bg-primary rounded-full"
                style={{ width: `${(currentTime / track.duration) * 100}%` }}
              ></div>
            </div>
            
            {/* Controls */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-text-secondary">
                {formatTime(currentTime)} / {formatTime(track.duration)}
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={toggleMute}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 accent-primary"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Tracks */}
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">More from {track.category.name}</h2>
          
          {relatedTracks.length === 0 ? (
            <div className="bg-background-light/10 rounded-xl p-8 text-center">
              <FiMusic className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary text-lg">No related tracks found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedTracks.map((relatedTrack) => (
                <Link 
                  href={`/tracks/${relatedTrack.id}`} 
                  key={relatedTrack.id}
                  className="group bg-background-light/10 rounded-xl overflow-hidden hover:bg-background-light/20 transition-colors duration-300"
                >
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src={relatedTrack.coverUrl || '/images/track-cover-1.svg'}
                      alt={relatedTrack.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <FiPlay className="text-white h-12 w-12" />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-text-primary truncate">{relatedTrack.title}</h3>
                    <p className="text-text-secondary text-sm truncate">{relatedTrack.artist}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-text-secondary">
                      <span>{formatTime(relatedTrack.duration)}</span>
                      <span className="px-2 py-1 bg-background-light/30 rounded-full">
                        {relatedTrack.category.name}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}