'use client';

import { useState, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { FiSave, FiArrowLeft, FiImage, FiUpload } from 'react-icons/fi';
import AdminLayout from '@/components/admin/AdminLayout';
import Image from 'next/image';

export default function NewCategoryPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverUrl: '',
    slug: '',
  });
  
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
      
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const onDropCover = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, WEBP, BMP)');
        return;
      }

      setCoverFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);
      setFormData(prev => ({ ...prev, coverUrl: previewUrl }));
      setError('');
    }
  }, []);

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDragActive } = useDropzone({
    onDrop: onDropCover,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp']
    },
    multiple: false
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let coverUrl = formData.coverUrl;

      // Upload cover file if selected
      if (coverFile) {
        const coverFormData = new FormData();
        coverFormData.append('file', coverFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: coverFormData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload cover image');
        }

        const uploadData = await uploadRes.json();
        coverUrl = uploadData.url;
      }

      // Create category with uploaded cover URL
      const categoryData = {
        ...formData,
        coverUrl
      };

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create category');
      }

      setSuccess(true);
      // Redirect to categories list after successful creation
      setTimeout(() => {
        router.push('/admin/categories');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating category:', error);
      setError(error.message || 'An error occurred while creating the category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-background-light/10 hover:bg-background-light/20 transition-colors"
            aria-label="Go back"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-text-primary">Add New Category</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-3 rounded-lg">
            Category created successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-background-light/10 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-text-secondary">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-background-light/5 border border-background-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter category title"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="block text-sm font-medium text-text-secondary">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-background-light/5 border border-background-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter category slug"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                Cover Image *
              </label>
              <div className="space-y-4">
                {/* File Upload Area */}
                <div
                  {...getCoverRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isCoverDragActive
                      ? 'border-primary bg-primary/10'
                      : 'border-background-light/30 hover:border-primary/50'
                  }`}
                >
                  <input {...getCoverInputProps()} />
                  <FiImage className="mx-auto mb-2 text-text-secondary" size={32} />
                  <p className="text-text-secondary mb-1">
                    {isCoverDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                  </p>
                  <p className="text-sm text-text-secondary/70">or</p>
                  <div className="mt-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2 mx-auto cursor-pointer">
                    <FiUpload size={16} />
                    Choose File
                  </div>
                  <p className="text-xs text-text-secondary/70 mt-2">
                    Supported formats: JPEG, PNG, GIF, WEBP, BMP
                  </p>
                </div>

                {/* Manual URL Input */}
                <div className="space-y-2">
                  <label htmlFor="coverUrl" className="block text-sm font-medium text-text-secondary">
                    Or enter image URL
                  </label>
                  <input
                    type="text"
                    id="coverUrl"
                    name="coverUrl"
                    value={formData.coverUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-background-light/5 border border-background-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 bg-background-light/5 border border-background-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter category description"
            />
          </div>

          {/* Cover Preview */}
          {(coverPreview || formData.coverUrl) && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                Cover Preview
              </label>
              <div className="relative w-full h-48 bg-background-light/10 rounded-lg overflow-hidden">
                <Image
                  src={coverPreview || formData.coverUrl}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                  onError={() => {
                    setCoverPreview('');
                    setFormData(prev => ({ ...prev, coverUrl: '' }));
                  }}
                />
              </div>
              {coverFile && (
                <p className="text-sm text-green-500">
                  ✓ New cover image selected: {coverFile.name}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  <span>Save Category</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}