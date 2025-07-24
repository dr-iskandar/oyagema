import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get total count of tracks
    const totalTracks = await prisma.track.count();
    
    if (totalTracks === 0) {
      return NextResponse.json(
        { error: 'No tracks available' },
        { status: 404 }
      );
    }

    // Generate a seed based on current date (YYYY-MM-DD)
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Create a simple hash from date string to get consistent random index for the day
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Get positive index within tracks range
    const randomIndex = Math.abs(hash) % totalTracks;
    
    // Get the track at the calculated index
    const track = await prisma.track.findMany({
      skip: randomIndex,
      take: 1,
      include: {
        category: true,
      },
    });

    if (!track || track.length === 0) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    const dailyTrack = track[0];
    
    // Return the daily recommendation with additional metadata
    return NextResponse.json({
      id: dailyTrack.id,
      title: dailyTrack.title,
      artist: dailyTrack.artist,
      description: dailyTrack.description || `Nikmati ${dailyTrack.title} dari ${dailyTrack.artist} sebagai rekomendasi harian Anda.`,
      coverUrl: dailyTrack.coverUrl,
      audioUrl: dailyTrack.audioUrl,
      duration: dailyTrack.duration,
      category: dailyTrack.category,
      date: dateString,
      isDaily: true
    });
  } catch (error) {
    console.error('Error fetching daily recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily recommendation' },
      { status: 500 }
    );
  }
}