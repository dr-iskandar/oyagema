'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiEdit2, FiUser, FiMail, FiLock, FiSave, FiX, FiMusic, FiHeart, FiClock } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import { useUser, useUpdateUser } from '@/lib/hooks/useUsers';
import { usePlaylists } from '@/lib/hooks/usePlaylists';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { useHistory } from '@/lib/hooks/useHistory';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const userId = authUser?.id || '';
  
  const { user, loading: userLoading, error: userError } = useUser(userId);
  const { playlists, loading: playlistsLoading } = usePlaylists(userId);
  const { favorites, loading: favoritesLoading } = useFavorites(userId);
  const { history, loading: historyLoading } = useHistory(userId);
  const { updateUser, loading: updateLoading, error: updateError, success } = useUpdateUser(userId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    image: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        image: user.image || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    let valid = true;
    const errors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      valid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Email is invalid';
      valid = false;
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const updateData: any = {
      id: userId,
      name: formData.name,
      email: formData.email,
    };
    
    // Only include password if it was changed
    if (formData.password) {
      updateData.password = formData.password;
    }
    
    // Only include image if it was changed
    if (formData.image && formData.image !== user?.image) {
      updateData.image = formData.image;
    }
    
    updateUser(updateData);
    setIsEditing(false);
  };
  
  const cancelEdit = () => {
    // Reset form data to current user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        image: user.image || ''
      });
    }
    setFormErrors({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setIsEditing(false);
  };

  // Show loading state
  if (userLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (userError || !user) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Oops! Something went wrong</h2>
          <p className="text-text-secondary mb-6">
            {userError || 'User not found'}
          </p>
          <button 
            className="btn-primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div 
          className="bg-background-light/10 rounded-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start space-x-8">
            <div className="relative">
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-primary">
                <Image 
                  src={user.image || '/icons/icon.svg'} 
                  alt={user.name || 'User'} 
                  fill 
                  className="object-cover"
                />
              </div>
              {!isEditing && (
                <button 
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg"
                  onClick={() => setIsEditing(true)}
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-text-secondary mb-1">Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                        <FiUser />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-background-light/20 rounded-lg py-2 px-10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Your name"
                      />
                    </div>
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1">Email</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                        <FiMail />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-background-light/20 rounded-lg py-2 px-10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Your email"
                      />
                    </div>
                    {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1">New Password (leave blank to keep current)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                        <FiLock />
                      </span>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full bg-background-light/20 rounded-lg py-2 px-10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="New password"
                      />
                    </div>
                    {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1">Confirm New Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                        <FiLock />
                      </span>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full bg-background-light/20 rounded-lg py-2 px-10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Confirm new password"
                      />
                    </div>
                    {formErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>}
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button 
                      type="submit" 
                      className="btn-primary flex items-center space-x-2"
                      disabled={updateLoading}
                    >
                      {updateLoading ? (
                        <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                      ) : (
                        <FiSave />
                      )}
                      <span>Save Changes</span>
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary flex items-center space-x-2"
                      onClick={cancelEdit}
                    >
                      <FiX />
                      <span>Cancel</span>
                    </button>
                  </div>
                  {updateError && <p className="text-red-500 mt-4">{updateError}</p>}
                  {success && <p className="text-green-500 mt-4">Profile updated successfully!</p>}
                </form>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-text-primary mb-2">{user.name}</h1>
                  <p className="text-text-secondary mb-6">{user.email}</p>
                  {/* Statistics temporarily hidden */}
                  {/* <div className="flex space-x-6 text-text-secondary">
                    <div className="flex items-center space-x-2">
                      <FiMusic />
                      <span>{playlists?.length || 0} Playlists</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiHeart />
                      <span>{favorites?.length || 0} Favorites</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiClock />
                      <span>{history?.length || 0} Recently Played</span>
                    </div>
                  </div> */}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* User's Playlists - Temporarily Hidden */}
        {/* <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-text-primary">Your Playlists</h2>
          {playlistsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : playlists && playlists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((playlist: any) => (
                <motion.a
                  key={playlist.id}
                  href={`/playlist/${playlist.id}`}
                  className="bg-background-light/10 rounded-xl overflow-hidden hover:bg-background-light/20 transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative h-40 w-full">
                    <Image
                      src={playlist.coverUrl || '/images/category-cover-1.svg'}
                      alt={playlist.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-text-primary">{playlist.title}</h3>
                    <p className="text-text-secondary text-sm">{playlist.tracks?.length || 0} tracks</p>
                  </div>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-background-light/10 rounded-xl">
              <p className="text-text-secondary">You haven't created any playlists yet.</p>
            </div>
          )}
        </motion.div> */}

        {/* Recently Played - Temporarily Hidden */}
        {/* <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-text-primary">Recently Played</h2>
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : history && history.length > 0 ? (
            <div className="bg-background-light/10 rounded-xl p-4 space-y-2">
              {history.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center p-2 hover:bg-background-light/20 rounded-lg transition-colors">
                  <div className="relative h-12 w-12 rounded-md overflow-hidden mr-4">
                    <Image
                      src={item.track?.coverUrl || '/images/track-cover-1.svg'}
                      alt={item.track?.title || 'Track'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-text-primary font-medium">{item.track?.title || 'Unknown Track'}</h4>
                    <p className="text-sm text-text-secondary">{item.track?.artist || 'Unknown Artist'}</p>
                  </div>
                  <div className="ml-auto text-sm text-text-secondary">
                    {new Date(item.playedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-background-light/10 rounded-xl">
              <p className="text-text-secondary">You haven't played any tracks yet.</p>
            </div>
          )}
        </motion.div> */}
      </div>
    </MainLayout>
  );
}