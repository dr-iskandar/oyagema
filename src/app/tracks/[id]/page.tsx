import { Metadata } from 'next';
import TrackPageClient from './TrackPageClient';

type Track = {
  id: string;
  title: string;
  artist: string;
  description: string | null;
  coverUrl: string | null;
  audioUrl: string;
  duration: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
};

interface TrackPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: TrackPageProps): Promise<Metadata> {
  try {
    // Fetch track data for metadata
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tracks/${params.id}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      return {
        title: 'Track Not Found - Oyagema Music Platform',
        description: 'The requested track could not be found on Oyagema music platform.'
      };
    }
    
    const track: Track = await res.json();
    
    const formatDuration = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    return {
      title: `${track.title} by ${track.artist} - Oyagema Music Platform`,
      description: track.description 
        ? `Listen to "${track.title}" by ${track.artist}. ${track.description} Duration: ${formatDuration(track.duration)}. Category: ${track.category.name}.`
        : `Listen to "${track.title}" by ${track.artist} on Oyagema music platform. Duration: ${formatDuration(track.duration)}. Category: ${track.category.name}.`,
      keywords: [
        track.title,
        track.artist,
        track.category.name,
        'music streaming',
        'audio track',
        'online music',
        'music player',
        'song',
        'listen online',
        'music platform'
      ],
      openGraph: {
        title: `${track.title} by ${track.artist}`,
        description: track.description 
          ? `Listen to "${track.title}" by ${track.artist}. ${track.description}`
          : `Listen to "${track.title}" by ${track.artist} on Oyagema music platform.`,
        type: 'music.song',
        url: `https://oyagema.com/tracks/${track.id}`,
        siteName: 'Oyagema',
        images: [
          {
            url: track.coverUrl || '/images/track-cover-1.svg',
            width: 1200,
            height: 1200,
            alt: `${track.title} by ${track.artist} - Album Cover`
          }
        ],
        audio: [
          {
            url: track.audioUrl,
            type: 'audio/mpeg'
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${track.title} by ${track.artist}`,
        description: track.description 
          ? `Listen to "${track.title}" by ${track.artist}. ${track.description}`
          : `Listen to "${track.title}" by ${track.artist} on Oyagema music platform.`,
        images: [track.coverUrl || '/images/track-cover-1.svg']
      },
      alternates: {
        canonical: `https://oyagema.com/tracks/${track.id}`
      },
      other: {
        'music:duration': track.duration.toString(),
        'music:album': track.category.name,
        'music:musician': track.artist
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Track - Oyagema Music Platform',
      description: 'Listen to music tracks on Oyagema music platform.'
    };
  }
}

export default function TrackPage({ params }: TrackPageProps) {
  return <TrackPageClient trackId={params.id} />;
}