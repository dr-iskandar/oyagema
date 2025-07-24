'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiSearch, FiMusic } from 'react-icons/fi';
import GuestLayout from '@/components/layout/GuestLayout';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  trackCount: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
        setFilteredCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(query) || 
        (category.description && category.description.toLowerCase().includes(query))
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  if (isLoading) {
    return (
      <GuestLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </GuestLayout>
    );
  }

  if (error) {
    return (
      <GuestLayout>
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-lg">
          {error}
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary">Categories</h1>
            <p className="text-text-secondary mt-1 text-sm sm:text-base">Browse music by genre and mood</p>
          </div>
          
          {/* Search */}
          <div className="relative w-full max-w-md mx-auto sm:mx-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-text-secondary" />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              className="pl-10 pr-4 py-3 w-full bg-background-light/20 border border-background-light/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary placeholder:text-text-secondary/70"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="bg-background-light/10 rounded-xl p-6 sm:p-8 text-center">
            <FiMusic className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-text-secondary mb-4" />
            <p className="text-text-secondary text-base sm:text-lg">
              {searchQuery ? 'No categories match your search' : 'No categories available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {filteredCategories.map((category) => (
              <Link 
                href={`/categories/${category.slug}`} 
                key={category.id}
                className="group relative overflow-hidden rounded-lg sm:rounded-xl aspect-square flex items-end hover:shadow-lg transition-all duration-300 active:scale-95"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={category.coverUrl || '/images/category-cover-1.svg'}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent group-hover:from-black/90 transition-colors duration-300"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 p-3 sm:p-4 md:p-6 w-full">
                  <h3 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-white group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {category.name}
                  </h3>
                  
                  {category.description && (
                    <p className="text-white/80 text-xs sm:text-sm mt-1 line-clamp-2 group-hover:text-white transition-colors duration-300 hidden sm:block">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="mt-1 sm:mt-2 inline-flex items-center text-xs text-white/70 group-hover:text-white transition-colors duration-300">
                    <FiMusic className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs">{category.trackCount} tracks</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Featured Categories */}
        <div className="mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 sm:mb-6 text-center sm:text-left">Featured Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* This would be populated with featured categories in a real app */}
            <div className="bg-background-light/10 rounded-xl p-6 sm:p-8 text-center">
              <FiMusic className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary text-base sm:text-lg">Featured categories will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}