import { useState, useEffect } from 'react';

type Category = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

export function useCategoryBySlug(slug: string) {
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategory() {
      if (!slug) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/categories/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Category not found');
          }
          throw new Error('Failed to fetch category');
        }
        
        const data = await response.json();
        setCategory(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching category ${slug}:`, err);
        setError('Failed to load category. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchCategory();
  }, [slug]);

  return { category, loading, error };
}