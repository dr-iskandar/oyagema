'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiX, FiUser, FiMail, FiLock, FiImage } from 'react-icons/fi';
import AdminLayout from '@/components/admin/AdminLayout';

type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
};

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    image: '',
  });
  // const [originalEmail, setOriginalEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        
        const user: User = await res.json();
        setFormData({
          name: user.name,
          email: user.email,
          password: '',
          confirmPassword: '',
          image: user.image || '',
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        setSubmitMessage({
          type: 'error',
          message: 'Failed to load user data',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password is optional when editing, but if provided, validate it
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (formData.image && !formData.image.trim().startsWith('http')) {
      newErrors.image = 'Image URL must be a valid URL';
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
      // Prepare update data (only include password if it was changed)
      const updateData: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        image: formData.image || null,
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user');
      }
      
      setSubmitMessage({
        type: 'success',
        message: 'User updated successfully!',
      });
      
      // Redirect to users list after a short delay
      setTimeout(() => {
        router.push('/admin/users');
      }, 1500);
      
    } catch {
      setSubmitMessage({
        type: 'error',
        message: 'Failed to update user',
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
          <h1 className="text-3xl font-bold text-text-primary">Edit User</h1>
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
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-text-secondary" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full bg-background-light/10 border ${errors.name ? 'border-red-500' : 'border-background-light/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Enter user name"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-text-secondary" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full bg-background-light/10 border ${errors.email ? 'border-red-500' : 'border-background-light/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                Password (leave blank to keep current)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-text-secondary" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full bg-background-light/10 border ${errors.password ? 'border-red-500' : 'border-background-light/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Enter new password"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-text-secondary" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full bg-background-light/10 border ${errors.confirmPassword ? 'border-red-500' : 'border-background-light/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Confirm new password"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-text-secondary mb-1">
                Profile Image URL (optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiImage className="text-text-secondary" />
                </div>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full bg-background-light/10 border ${errors.image ? 'border-red-500' : 'border-background-light/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
              <p className="mt-1 text-xs text-text-secondary">Leave blank to use default avatar</p>
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
                  <span>Updating User...</span>
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  <span>Update User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}