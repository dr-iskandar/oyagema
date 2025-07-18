'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import AdminLayout from '@/components/admin/AdminLayout';

type Category = {
  id: string;
  title: string;
  description?: string;
  coverUrl: string;
  slug: string;
  createdAt: string;
};

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/categories/${slug}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }

      // Remove the deleted category from the state
      setCategories(categories.filter(category => category.slug !== slug));
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(category => 
    category.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-text-primary">Manage Categories</h1>
          <button
            onClick={() => router.push('/admin/categories/new')}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <FiPlus size={18} />
            <span>Add New Category</span>
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-text-secondary" />
          </div>
          <input
            type="text"
            placeholder="Search categories..."
            className="pl-10 pr-4 py-2 w-full bg-background-light/10 border border-background-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-background-light/10 rounded-xl p-8 text-center">
            <p className="text-text-secondary text-lg">
              {searchQuery ? 'No categories found matching your search.' : 'No categories available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-background-light/10 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 w-full">
                  <Image
                    src={category.coverUrl || '/images/category-cover-1.svg'}
                    alt={category.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold text-text-primary mb-2">{category.title}</h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {category.description || 'No description available'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary">
                      Slug: {category.slug}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/admin/categories/${category.slug}/edit`)}
                        className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        aria-label="Edit category"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.slug)}
                        className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                        aria-label="Delete category"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}