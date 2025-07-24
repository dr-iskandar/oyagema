import React from 'react';
import { Metadata } from 'next';
import CategoryPageClient from './CategoryPageClient';

// Generate metadata for category pages
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  
  try {
    // Fetch category data for metadata
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories/${slug}`);
    
    if (!res.ok) {
      return {
        title: 'Category Not Found | Oyagema',
        description: 'The requested category could not be found on Oyagema spiritual music streaming platform.',
      };
    }
    
    const category = await res.json();
    
    return {
      title: `${category.title} - Spiritual Music Category | Oyagema`,
      description: `Explore ${category.title} spiritual music on Oyagema. ${category.description || 'Discover healing music, meditation tracks, and mindfulness content.'} Stream ${category.tracks?.length || 0} tracks in this category.`,
      keywords: [
        category.title.toLowerCase(),
        'spiritual music',
        'healing music',
        'meditation music',
        'mindfulness',
        'musik spiritual',
        'lagu rohani',
        category.title.toLowerCase().includes('healing') ? 'musik penyembuhan' : '',
        category.title.toLowerCase().includes('meditation') ? 'musik meditasi' : '',
      ].filter(Boolean),
      openGraph: {
        title: `${category.title} - Spiritual Music Category | Oyagema`,
        description: `Explore ${category.title} spiritual music on Oyagema. ${category.description || 'Discover healing music, meditation tracks, and mindfulness content.'}`,
        images: [
          {
            url: category.coverUrl || '/images/og-image.svg',
            width: 1200,
            height: 630,
            alt: `${category.title} - Spiritual Music Category`,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${category.title} - Spiritual Music Category | Oyagema`,
        description: `Explore ${category.title} spiritual music on Oyagema. ${category.description || 'Discover healing music and meditation tracks.'}`,
        images: [category.coverUrl || '/images/og-image.svg'],
      },
      alternates: {
        canonical: `/category/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for category:', error);
    return {
      title: 'Spiritual Music Category | Oyagema',
      description: 'Explore spiritual music categories on Oyagema. Discover healing music, meditation tracks, and mindfulness content.',
    };
  }
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  return <CategoryPageClient slug={slug} />;
}