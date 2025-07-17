'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiX, FiMusic, FiImage, FiUser } from 'react-icons/fi';
import AdminLayout from '@/components/admin/AdminLayout';

type User = {
  id: string;
  name: string;
  email: string;
};

type Playlist = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  userId: string;
};

export default function EditPlaylistPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverUrl: '',
    userId: '',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersRes = await fetch('/api/users');
        if (!usersRes.ok) throw new Error('Failed to fetch users');
        const usersData = await usersRes.json();
        setUsers(usersData);
        
        // Fetch playlist
        const playlistRes = await fetch(`/api/playlists/${id}`);
        if (!playlistRes.ok) throw new Error('Failed to fetch playlist');
        
        const playlist: Playlist = await playlistRes.json();
        setFormData({
          title: playlist.title,
          description: playlist.description || '',
          coverUrl: playlist.coverUrl || '',
          userId: playlist.userId,
        });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.userId) newErrors.userId = 'User is required';
    
    if (formData.coverUrl && !formData.coverUrl.trim().startsWith('http')) {
      newErrors.coverUrl = 'Cover URL must be a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitMessage({ type: '', message: '' });
    
    try {
      const res = await fetch(`/api/playlists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          coverUrl: formData.coverUrl || null,
          userId: formData.userId,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update playlist');
      }
      
      setSubmitMessage({
        type: 'success',
        message: 'Playlist updated successfully!',
      });
      
      // Redirect to playlists list after a short delay
      setTimeout(() => {
        router.push('/admin/playlists');
      }, 1500);
      
    } catch (error: any) {
      setSubmitMessage({
        type: 'error',
        message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">Edit Playlist</h1>
          <button
            onClick={() => router.back()}
            className="btn-secondary flex items-center gap-2"
          >
            <FiX size={18} />
            <span>Cancel</span>
          </button>
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

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">
                Title
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMusic className="text-text-secondary" />
                </div>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full bg-background-light/10 border ${errors.title ? 'border-red-500' : 'border-background-light/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Enter playlist title"
                />
              </div>
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`px-4 py-2 w-full bg-background-light/10 border border-background-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Enter playlist description"
              />
            </div>

            <div>
              <label htmlFor="coverUrl" className="block text-sm font-medium text-text-secondary mb-1">
                Cover Image URL (optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiImage className="text-text-secondary" />
                </div>
                <input
                  type="text"
                  id="coverUrl"
                  name="coverUrl"
                  value={formData.coverUrl}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full bg-background-light/10 border ${errors.coverUrl ? 'border-red-500' : 'border-background-light/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {errors.coverUrl && <p className="mt-1 text-sm text-red-500">{errors.coverUrl}</p>}
              <p className="mt-1 text-xs text-text-secondary">Leave blank to use default cover</p>
            </div>

            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-text-secondary mb-1">
                User
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-text-secondary" />
                </div>
                <select
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full bg-background-light/10 border ${errors.userId ? 'border-red-500' : 'border-background-light/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none`}
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              {errors.userId && <p className="mt-1 text-sm text-red-500">{errors.userId}</p>}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Updating Playlist...</span>
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  <span>Update Playlist</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}