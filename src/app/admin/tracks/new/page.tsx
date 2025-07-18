'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiArrowLeft, FiMusic, FiImage } from 'react-icons/fi';
import AdminLayout from '@/components/admin/AdminLayout';
import { useDropzone } from 'react-dropzone';
import jsmediatags from 'jsmediatags-web';
import Image from 'next/image';

// Define types for jsmediatags-web since they're not directly exported
interface TagType {
  tags: {
    title?: string;
    artist?: string;
    picture?: {
      data: number[];
      format: string;
    };
  };
}

interface ErrorType {
  type: string;
  info: string;
}

type Category = {
  id: string;
  title: string;
};

export default function NewTrackPage() {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    description: '',
    coverUrl: '',
    audioUrl: '',
    duration: '',
    categoryId: '',
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again.');
      }
    };

    fetchCategories();
  }, []);
  
  // Function to extract metadata from audio file
  const extractMetadata = (file: File) => {
    // Get title from filename (remove extension)
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    
    // Create object URL for audio preview
    const audioUrl = URL.createObjectURL(file);
    setAudioPreview(audioUrl);
    
    // Create a new audio element to get duration
    const audio = new Audio(audioUrl);
    audio.addEventListener('loadedmetadata', () => {
      // Format duration as mm:ss
      const minutes = Math.floor(audio.duration / 60);
      const seconds = Math.floor(audio.duration % 60);
      const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      // Update form with extracted data
      setFormData(prev => ({
        ...prev,
        title: fileName,
        duration: formattedDuration,
        // Default artist to "Oyagema" if not provided
        artist: prev.artist || 'Oyagema'
      }));
    });
    
    // Extract ID3 tags from MP3 file
    jsmediatags.read(file, {
      onSuccess: (tag: TagType) => {
        console.log('ID3 tags:', tag);
        
        // Extract title, artist, and cover art if available
        if (tag.tags) {
          const { title, artist, picture } = tag.tags;
          
          // Update title if available in ID3 tags
          if (title) {
            setFormData(prev => ({ ...prev, title }));
          }
          
          // Update artist if available in ID3 tags, otherwise keep "Oyagema"
          if (artist) {
            setFormData(prev => ({ ...prev, artist }));
          } else if (!formData.artist) {
            setFormData(prev => ({ ...prev, artist: 'Oyagema' }));
          }
          
          // Extract cover art if available
          if (picture) {
            const { data, format } = picture;
            let base64String = "";
            for (let i = 0; i < data.length; i++) {
              base64String += String.fromCharCode(data[i]);
            }
            const coverUrl = `data:${format};base64,${btoa(base64String)}`;
            setCoverPreview(coverUrl);
            setFormData(prev => ({ ...prev, coverUrl }));
          }
        }
      },
      onError: (error: ErrorType) => {
        console.error('Error reading ID3 tags:', error);
      }
    });
  };
  
  // Setup dropzone for audio file upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && (file.type.includes('audio/mpeg') || file.type.includes('audio/mp3') || file.name.toLowerCase().endsWith('.mp3'))) {
      setAudioFile(file);
      extractMetadata(file);
    } else {
      setError('Error: Format file tidak valid. Silakan unggah file MP3.');
    }
  }, [formData.artist, extractMetadata]);
  
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
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/mp3': ['.mp3'],
      'audio/*': ['.mp3']
    },
    maxFiles: 1
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Setup dropzone for cover image
  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDragActive } = useDropzone({
    onDrop: onDropCover,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    // Validate that an audio file has been uploaded
    if (!audioFile) {
      setError('Error: Anda harus mengunggah file audio MP3');
      setLoading(false);
      return;
    }
    
    // Validate required fields with detailed error messages
    const missingFields = [];
    if (!formData.title) missingFields.push('judul track');
    if (!formData.artist) missingFields.push('nama artis');
    if (!formData.duration) missingFields.push('durasi');
    if (!formData.categoryId) missingFields.push('kategori');
    
    if (missingFields.length > 0) {
      setError(`Error: Silakan lengkapi kolom berikut: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      // Create FormData for audio file upload
      const fileData = new FormData();
      fileData.append('file', audioFile);
      
      // Upload the audio file to get a URL
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: fileData,
      });
      
      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Failed to upload audio file');
      }
      
      const uploadData = await uploadRes.json();
      const audioUrl = uploadData.url;
      
      // Upload cover image if provided
      let coverUrl = formData.coverUrl;
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
      
      // If no cover image is provided, use a random cover from the public images folder
      if (!coverUrl || coverUrl === '') {
        // Random number between 1 and 8 to select a random cover image
        const randomCoverNum = Math.floor(Math.random() * 8) + 1;
        const fileExtension = randomCoverNum <= 2 ? 'svg' : 'png';
        coverUrl = `/images/track-cover-${randomCoverNum}.${fileExtension}`;
      }
      
      // Create the track with the form data and URLs
      const trackData = {
        ...formData,
        audioUrl,
        coverUrl,
      };
      
      const res = await fetch('/api/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create track');
      }

      setSuccess(true);
      // Redirect to tracks list after successful creation
      setTimeout(() => {
        router.push('/admin/tracks');
      }, 1500);
    } catch (error: unknown) {
      console.error('Error creating track:', error);
      setError('Error: Terjadi kesalahan saat membuat track. Silakan coba lagi.');
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
          <h1 className="text-3xl font-bold text-text-primary">Add New Track</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-3 rounded-lg">
            Track created successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-background-light/10 rounded-xl p-6 space-y-6 shadow-lg border border-background-light/20">
          {/* Audio File Upload Dropzone */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Upload Audio File (MP3) *
            </label>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-background-light/30 hover:border-primary/50 hover:bg-background-light/5'}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <FiMusic size={32} className="text-primary" />
                </div>
                {isDragActive ? (
                  <p className="text-primary font-medium">Drop the audio file here...</p>
                ) : (
                  <>
                    <p className="mb-2 font-medium">Drag &amp; drop an MP3 file here, or click to select</p>
                    <p className="text-sm text-text-secondary">The file&apos;s metadata will be automatically extracted</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Audio Preview */}
          {audioPreview && (
            <div className="mb-6 p-4 bg-background-light/10 rounded-lg border-2 border-background-light/20 shadow-inner">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <FiMusic className="mr-2 text-accent" /> Audio Preview
              </h3>
              <audio controls className="w-full mt-2 audio-player">
                <source src={audioPreview} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          
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
                className="w-full px-4 py-3 bg-background-light/10 border-2 border-background-light/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-inner text-text-primary placeholder-text-muted/70"
                placeholder="Enter track title"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="artist" className="block text-sm font-medium text-text-secondary">
                Artist * <span className="text-xs text-text-secondary">(defaults to &quot;Oyagema&quot; if empty)</span>
              </label>
              <input
                type="text"
                id="artist"
                name="artist"
                value={formData.artist}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-background-light/10 border-2 border-background-light/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-inner text-text-primary placeholder-text-muted/70"
                placeholder="Enter artist name"
              />
            </div>
            
            {/* Cover Image Upload */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary">
              Cover Image <span className="text-xs text-text-secondary">(Opsional - akan menggunakan gambar acak jika tidak diunggah)</span>
            </label>
              <div className="flex flex-col md:flex-row gap-4">
                <div 
                  {...getCoverRootProps()} 
                  className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors flex-1 ${isCoverDragActive ? 'border-accent bg-accent/5' : 'border-background-light/20 hover:border-accent/50'}`}
                >
                  <input {...getCoverInputProps()} />
                  <div className="flex flex-col items-center justify-center text-center">
                    <FiImage size={36} className="mb-2 text-text-secondary" />
                    {isCoverDragActive ? (
                      <p>Drop the image here...</p>
                    ) : (
                      <p className="text-sm">Drag & drop a cover image, or click to select</p>
                    )}
                  </div>
                </div>
                
                {coverPreview && (
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-lg overflow-hidden shadow-lg border-2 border-accent/30">
                      <Image 
                        src={coverPreview} 
                        alt="Cover preview" 
                        width={128} 
                        height={128} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <p className="text-xs text-text-secondary mt-2">Cover Preview</p>
                  </div>
                )}
              </div>
              <input
                type="hidden"
                id="coverUrl"
                name="coverUrl"
                value={formData.coverUrl}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="duration" className="block text-sm font-medium text-text-secondary">
                Duration * <span className="text-xs text-text-secondary">(extracted from MP3)</span>
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-background-light/10 border-2 border-background-light/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-inner text-text-primary placeholder-text-muted/70"
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
                className="w-full px-4 py-3 bg-background-light/10 border-2 border-background-light/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-inner text-text-primary appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%23CBD5E1%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[size:1.5em_1.5em] bg-no-repeat pr-10"
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
              className="w-full px-4 py-3 bg-background-light/10 border-2 border-background-light/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-inner text-text-primary placeholder-text-muted/70 resize-none"
              placeholder="Enter track description"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-light to-accent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  <span>Save Track</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}