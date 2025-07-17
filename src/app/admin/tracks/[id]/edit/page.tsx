'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiSave, FiArrowLeft, FiMusic, FiPlay, FiImage, FiUpload } from 'react-icons/fi';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAudioPlayer } from '@/lib/contexts/AudioPlayerContext';
import { useDropzone } from 'react-dropzone';

type Category = {
  id: string;
  title: string;
};

type Track = {
  id: string;
  title: string;
  artist: string;
  description: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  categoryId: string;
};

export default function EditTrackPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { playTrack } = useAudioPlayer();
  
  const [formData, setFormData] = useState<Track>({
    id: '',
    title: '',
    artist: '',
    description: '',
    coverUrl: '',
    audioUrl: '',
    duration: '',
    categoryId: '',
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch track data
        const trackRes = await fetch(`/api/tracks/${id}`);
        if (!trackRes.ok) throw new Error('Failed to fetch track');
        const trackData = await trackRes.json();
        setFormData(trackData);

        // Fetch categories
        const categoriesRes = await fetch('/api/categories');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Setup dropzone for cover image upload
  const onDropCover = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.includes('image')) {
      setCoverFile(file);
      const imageUrl = URL.createObjectURL(file);
      setCoverPreview(imageUrl);
      setFormData(prev => ({ ...prev, coverUrl: imageUrl }));
    } else {
      setError('Error: Format file tidak valid. Silakan unggah file gambar (JPG, PNG, GIF).');
    }
  }, []);
  
  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDragActive } = useDropzone({
    onDrop: onDropCover,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp']
    },
    maxFiles: 1
  });
  
  const handlePlayTrack = () => {
    if (formData.audioUrl) {
      playTrack({
        id: formData.id,
        title: formData.title,
        artist: formData.artist,
        coverUrl: formData.coverUrl || '/images/track-cover-1.svg',
        audioUrl: formData.audioUrl,
        duration: formData.duration,
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      let coverUrl = formData.coverUrl;
      
      // Upload cover image if a new file is selected
      if (coverFile) {
        const coverData = new FormData();
        coverData.append('file', coverFile);
        
        const coverUploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: coverData,
        });
        
        if (!coverUploadRes.ok) {
          const errorData = await coverUploadRes.json();
          throw new Error(errorData.error || 'Failed to upload cover image');
        }
        
        const coverUploadData = await coverUploadRes.json();
        coverUrl = coverUploadData.url;
      }
      
      // Update track data with new cover URL if uploaded
      const trackData = {
        ...formData,
        coverUrl,
      };

      const res = await fetch(`/api/tracks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update track');
      }

      setSuccess(true);
      // Redirect to tracks list after successful update
      setTimeout(() => {
        router.push('/admin/tracks');
      }, 1500);
    } catch (error: any) {
      console.error('Error updating track:', error);
      setError(error.message || 'An error occurred while updating the track');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/tracks')}
            className="p-2 rounded-full bg-background-light/10 hover:bg-background-light/20 transition-colors"
            aria-label="Go back"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-text-primary">Edit Track</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-3 rounded-lg">
            Track updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-background-light/10 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-6">
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
                    placeholder="Enter track title"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="artist" className="block text-sm font-medium text-text-secondary">
                    Artist *
                  </label>
                  <input
                    type="text"
                    id="artist"
                    name="artist"
                    value={formData.artist}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-background-light/5 border border-background-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter artist name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-secondary">
                    Cover Image
                  </label>
                  <div className="flex flex-col gap-4">
                    <div 
                      {...getCoverRootProps()} 
                      className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${isCoverDragActive ? 'border-primary bg-primary/10' : 'border-background-light/30 hover:border-primary/50 hover:bg-background-light/5'}`}
                    >
                      <input {...getCoverInputProps()} />
                      <div className="flex flex-col items-center justify-center text-center">
                        <FiImage size={32} className="mb-2 text-text-secondary" />
                        {isCoverDragActive ? (
                          <p className="text-primary font-medium">Drop the image here...</p>
                        ) : (
                          <>
                            <p className="mb-1 font-medium">Drag & drop a cover image, or click to select</p>
                            <p className="text-sm text-text-secondary">Supports JPG, PNG, GIF, WebP, BMP</p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="coverUrl" className="block text-sm font-medium text-text-secondary">
                        Or enter Cover URL
                      </label>
                      <input
                        type="text"
                        id="coverUrl"
                        name="coverUrl"
                        value={formData.coverUrl}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-background-light/5 border border-background-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter cover image URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="audioUrl" className="block text-sm font-medium text-text-secondary">
                    Audio URL *
                  </label>
                  <input
                    type="text"
                    id="audioUrl"
                    name="audioUrl"
                    value={formData.audioUrl}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-background-light/5 border border-background-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter audio file URL"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="duration" className="block text-sm font-medium text-text-secondary">
                    Duration *
                  </label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-background-light/5 border border-background-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 3:45"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="categoryId" className="block text-sm font-medium text-text-secondary">
                    Category *
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-background-light/5 border border-background-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
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
                  placeholder="Enter track description"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Cover Preview
                </label>
                <div className="bg-background-light/5 border border-dashed border-background-light/20 rounded-lg p-4 flex flex-col items-center justify-center">
                  {(coverPreview || formData.coverUrl) ? (
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={coverPreview || formData.coverUrl}
                        alt="Track cover preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-64 w-full flex flex-col items-center justify-center text-text-secondary">
                      <FiMusic size={48} className="mb-4" />
                      <p>Cover image preview will appear here</p>
                    </div>
                  )}
                </div>
                {coverFile && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                    New cover image selected: {coverFile.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Audio Preview
                  </label>
                  <div className="bg-background-light/5 border border-dashed border-background-light/20 rounded-lg p-4">
                    {formData.audioUrl ? (
                      <div className="space-y-3">
                        <audio
                          controls
                          className="w-full"
                          src={formData.audioUrl}
                        >
                          Your browser does not support the audio element.
                        </audio>
                        <button
                          type="button"
                          onClick={handlePlayTrack}
                          className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg text-white hover:bg-primary/80 transition-colors"
                        >
                          <FiPlay size={18} />
                          <span>Play in Music Player</span>
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 flex flex-col items-center justify-center text-text-secondary">
                        <p>Audio preview will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-background-light/20">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}