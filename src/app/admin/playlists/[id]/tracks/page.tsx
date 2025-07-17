'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiPlus, FiTrash2, FiArrowLeft, FiSearch, FiMusic, FiClock } from 'react-icons/fi';
import AdminLayout from '@/components/admin/AdminLayout';

type Track = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: number;
  categoryId: string;
};

type PlaylistTrack = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;
  addedAt: string;
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
  tracks: PlaylistTrack[];
};

export default function PlaylistTracksPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch playlist
        const playlistRes = await fetch(`/api/playlists/${id}`);
        if (!playlistRes.ok) throw new Error('Failed to fetch playlist');
        const playlistData = await playlistRes.json();
        setPlaylist(playlistData);
        
        // Fetch all tracks
        const tracksRes = await fetch('/api/tracks');
        if (!tracksRes.ok) throw new Error('Failed to fetch tracks');
        const tracksData = await tracksRes.json();
        setAvailableTracks(tracksData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSubmitMessage({
          type: 'error',
          message: 'Failed to load data',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddTracks = async () => {
    if (selectedTrackIds.length === 0) {
      setSubmitMessage({
        type: 'error',
        message: 'Please select at least one track to add',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });

    try {
      // Get current track IDs
      const currentTrackIds = playlist?.tracks.map(track => track.id) || [];
      
      // Combine with newly selected tracks
      const allTrackIds = [...currentTrackIds, ...selectedTrackIds];
      
      // Update playlist with new tracks
      const res = await fetch(`/api/playlists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: playlist?.title,
          description: playlist?.description,
          coverUrl: playlist?.coverUrl,
          trackIds: allTrackIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update playlist');
      }

      // Refresh the page to show updated tracks
      window.location.reload();
    } catch (error: any) {
      setSubmitMessage({
        type: 'error',
        message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!confirm('Are you sure you want to remove this track from the playlist?')) return;

    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });

    try {
      // Filter out the track to remove
      const updatedTrackIds = playlist?.tracks
        .filter(track => track.id !== trackId)
        .map(track => track.id) || [];
      
      // Update playlist with new tracks
      const res = await fetch(`/api/playlists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: playlist?.title,
          description: playlist?.description,
          coverUrl: playlist?.coverUrl,
          trackIds: updatedTrackIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update playlist');
      }

      // Update local state
      if (playlist) {
        setPlaylist({
          ...playlist,
          tracks: playlist.tracks.filter(track => track.id !== trackId),
          trackCount: playlist.trackCount - 1,
        });
      }

      setSubmitMessage({
        type: 'success',
        message: 'Track removed successfully',
      });
    } catch (error: any) {
      setSubmitMessage({
        type: 'error',
        message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTrackIds(prev => 
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Filter available tracks that are not already in the playlist
  const filteredAvailableTracks = availableTracks
    .filter(track => 
      !playlist?.tracks.some(pt => pt.id === track.id) &&
      (track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       track.artist.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!playlist) {
    return (
      <AdminLayout>
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-lg">
          Playlist not found
        </div>
        <button
          onClick={() => router.push('/admin/playlists')}
          className="mt-4 btn-secondary flex items-center gap-2"
        >
          <FiArrowLeft size={18} />
          <span>Back to Playlists</span>
        </button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/playlists')}
            className="btn-secondary flex items-center gap-2"
          >
            <FiArrowLeft size={18} />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-text-primary">Manage Tracks in Playlist</h1>
        </div>

        <div className="flex items-center gap-4 bg-background-light/10 p-4 rounded-xl">
          <div className="h-20 w-20 relative rounded-md overflow-hidden">
            <Image
              src={playlist.coverUrl || '/images/track-cover-1.svg'}
              alt={playlist.title}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{playlist.title}</h2>
            {playlist.description && (
              <p className="text-text-secondary mt-1">{playlist.description}</p>
            )}
            <p className="text-text-secondary mt-1">
              {playlist.trackCount} tracks • Created by {playlist.userName}
            </p>
          </div>
        </div>

        {submitMessage.message && (
          <div
            className={`p-4 rounded-lg ${
              submitMessage.type === 'success'
                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}
          >
            {submitMessage.message}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-4">Current Tracks</h2>
            {playlist.tracks.length === 0 ? (
              <div className="bg-background-light/10 rounded-xl p-8 text-center">
                <p className="text-text-secondary text-lg">No tracks in this playlist yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-background-light/10 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="border-b border-background-light/20">
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Track</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Artist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Added</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-background-light/20">
                    {playlist.tracks.map((track) => (
                      <tr key={track.id} className="hover:bg-background-light/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3 relative rounded-md overflow-hidden">
                              <Image
                                src={track.coverUrl || '/images/track-cover-1.svg'}
                                alt={track.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="text-sm font-medium text-text-primary">{track.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text-secondary">{track.artist}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-text-secondary">
                            <FiClock className="mr-2" />
                            {formatDuration(track.duration)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text-secondary">
                            {new Date(track.addedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveTrack(track.id)}
                            disabled={isSubmitting}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-background-light/20">
            <h2 className="text-xl font-bold text-text-primary mb-4">Add Tracks</h2>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-text-secondary" />
                </div>
                <input
                  type="text"
                  placeholder="Search tracks..."
                  className="pl-10 pr-4 py-2 w-full bg-background-light/10 border border-background-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {filteredAvailableTracks.length === 0 ? (
                <div className="bg-background-light/10 rounded-xl p-8 text-center">
                  <p className="text-text-secondary text-lg">
                    {searchQuery ? 'No tracks found matching your search.' : 'No tracks available to add.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-background-light/10 rounded-xl overflow-hidden">
                    <thead>
                      <tr className="border-b border-background-light/20">
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Select</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Track</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Artist</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-background-light/20">
                      {filteredAvailableTracks.map((track) => (
                        <tr key={track.id} className="hover:bg-background-light/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedTrackIds.includes(track.id)}
                              onChange={() => toggleTrackSelection(track.id)}
                              className="h-4 w-4 text-primary focus:ring-primary border-background-light/20 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 mr-3 relative rounded-md overflow-hidden">
                                <Image
                                  src={track.coverUrl || '/images/track-cover-1.svg'}
                                  alt={track.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="text-sm font-medium text-text-primary">{track.title}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-text-secondary">{track.artist}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-text-secondary">
                              <FiClock className="mr-2" />
                              {formatDuration(track.duration)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={handleAddTracks}
                  disabled={isSubmitting || selectedTrackIds.length === 0}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Adding Tracks...</span>
                    </>
                  ) : (
                    <>
                      <FiPlus size={18} />
                      <span>Add Selected Tracks</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}