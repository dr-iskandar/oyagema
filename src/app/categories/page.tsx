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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Categories</h1>
            <p className="text-text-secondary mt-1">Browse music by genre and mood</p>
          </div>
          
          {/* Search */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-text-secondary" />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              className="pl-10 pr-4 py-2 w-full bg-background-light/20 border border-background-light/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="bg-background-light/10 rounded-xl p-8 text-center">
            <FiMusic className="mx-auto h-12 w-12 text-text-secondary mb-4" />
            <p className="text-text-secondary text-lg">
              {searchQuery ? 'No categories match your search' : 'No categories available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Link 
                href={`/categories/${category.slug}`} 
                key={category.id}
                className="group relative overflow-hidden rounded-xl aspect-square flex items-end hover:shadow-lg transition-all duration-300"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={category.coverUrl || '/images/category-cover-1.svg'}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent group-hover:from-black/90 transition-colors duration-300"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 p-6 w-full">
                  <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors duration-300">
                    {category.name}
                  </h3>
                  
                  {category.description && (
                    <p className="text-white/80 text-sm mt-1 line-clamp-2 group-hover:text-white transition-colors duration-300">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="mt-2 inline-flex items-center text-xs text-white/70 group-hover:text-white transition-colors duration-300">
                    <FiMusic className="mr-1" />
                    <span>{category.trackCount} tracks</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Featured Categories */}
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Featured Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* This would be populated with featured categories in a real app */}
            <div className="bg-background-light/10 rounded-xl p-8 text-center">
              <FiMusic className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary text-lg">Featured categories will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}