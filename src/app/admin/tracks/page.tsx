'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPlay } from 'react-icons/fi';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAudioPlayer } from '@/lib/contexts/AudioPlayerContext';

type Track = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  categoryId: string;
  category?: {
    title: string;
  };
  createdAt: string;
};

export default function TracksAdminPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { playTrack } = useAudioPlayer();

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await fetch('/api/tracks');
        if (!res.ok) throw new Error('Failed to fetch tracks');
        const data = await res.json();
        setTracks(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this track?')) return;

    try {
      const res = await fetch(`/api/tracks/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete track');

      // Remove the deleted track from the state
      setTracks(tracks.filter(track => track.id !== id));
    } catch (error) {
      console.error('Error deleting track:', error);
    }
  };
  
  const handlePlayTrack = (track: Track) => {
    playTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      coverUrl: track.coverUrl || '/images/track-cover-1.svg',
      audioUrl: track.audioUrl,
      duration: track.duration,
    });
  };

  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-text-primary">Manage Tracks</h1>
          <button
            onClick={() => router.push('/admin/tracks/new')}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <FiPlus size={18} />
            <span>Add New Track</span>
          </button>
        </div>

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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="bg-background-light/10 rounded-xl p-8 text-center">
            <p className="text-text-secondary text-lg">
              {searchQuery ? 'No tracks found matching your search.' : 'No tracks available.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-background-light/10 rounded-xl overflow-hidden">
              <thead>
                <tr className="border-b border-background-light/20">
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Track</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Artist</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background-light/20">
                {filteredTracks.map((track) => (
                  <tr key={track.id} className="hover:bg-background-light/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3 relative rounded overflow-hidden">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {track.artist}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {track.category?.title || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {track.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handlePlayTrack(track)}
                          className="text-accent hover:text-accent-dark transition-colors"
                          title="Play track"
                        >
                          <FiPlay size={18} />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/tracks/${track.id}/edit`)}
                          className="text-primary hover:text-primary-dark transition-colors"
                          title="Edit track"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(track.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete track"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}