'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiMusic, FiUser } from 'react-icons/fi';
import AdminLayout from '@/components/admin/AdminLayout';

type Playlist = {
  id: string;
  title: string;
  coverUrl?: string;
  userId: string;
  user: {
    name: string;
  };
  _count: {
    tracks: number;
  };
  createdAt: string;
};

export default function PlaylistsAdminPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await fetch('/api/playlists/admin');
        if (!res.ok) throw new Error('Failed to fetch playlists');
        const data = await res.json();
        setPlaylists(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/playlists/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete playlist');

      // Remove the deleted playlist from the state
      setPlaylists(playlists.filter(playlist => playlist.id !== id));
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const filteredPlaylists = playlists.filter(playlist => 
    playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-text-primary">Manage Playlists</h1>
          <button
            onClick={() => router.push('/admin/playlists/new')}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <FiPlus size={18} />
            <span>Add New Playlist</span>
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-text-secondary" />
          </div>
          <input
            type="text"
            placeholder="Search playlists..."
            className="pl-10 pr-4 py-2 w-full bg-background-light/10 border border-background-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredPlaylists.length === 0 ? (
          <div className="bg-background-light/10 rounded-xl p-8 text-center">
            <p className="text-text-secondary text-lg">
              {searchQuery ? 'No playlists found matching your search.' : 'No playlists available.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-background-light/10 rounded-xl overflow-hidden">
              <thead>
                <tr className="border-b border-background-light/20">
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Playlist</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tracks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background-light/20">
                {filteredPlaylists.map((playlist) => (
                  <tr key={playlist.id} className="hover:bg-background-light/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3 relative rounded-md overflow-hidden">
                          <Image
                            src={playlist.coverUrl || '/images/track-cover-1.svg'}
                            alt={playlist.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="text-sm font-medium text-text-primary">{playlist.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-text-secondary">
                        <FiUser className="mr-2" />
                        {playlist.user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-text-secondary">
                        <FiMusic className="mr-2" />
                        {playlist._count.tracks}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">
                        {new Date(playlist.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/admin/playlists/${playlist.id}/edit`)}
                          className="text-primary hover:text-primary-dark transition-colors"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(playlist.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
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