import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { HistoryWithTrack } from '@/types/models';

// Get play history for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const history = await prisma.history.findMany({
      where: { userId },
      include: {
        track: true,
      },
      orderBy: {
        playedAt: 'desc',
      },
      take: 50, // Limit to recent 50 entries
    });

    // Group by track title and keep only the latest entry for each track
    const trackMap = new Map();
    
    history.forEach((entry) => {
      const trackKey = `${entry.track.title}-${entry.track.artist}`;
      if (!trackMap.has(trackKey) || new Date(entry.playedAt) > new Date(trackMap.get(trackKey).playedAt)) {
        trackMap.set(trackKey, entry);
      }
    });
    
    // Convert back to array and format the response
    const uniqueHistory = Array.from(trackMap.values());
    const formattedHistory = uniqueHistory.map((entry: HistoryWithTrack) => ({
      id: entry.id,
      userId: entry.userId,
      trackId: entry.trackId,
      playedAt: entry.playedAt,
      track: {
        id: entry.track.id,
        title: entry.track.title,
        artist: entry.track.artist,
        coverUrl: entry.track.coverUrl,
        audioUrl: entry.track.audioUrl,
        duration: entry.track.duration,
      },
    }));
    
    // Sort by playedAt descending
    formattedHistory.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());

    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error('Error fetching play history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch play history' },
      { status: 500 }
    );
  }
}

// Add a track to play history
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, trackId } = body;

    if (!userId || !trackId) {
      return NextResponse.json(
        { error: 'User ID and Track ID are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    // Add to history
    const historyEntry = await prisma.history.create({
      data: {
        userId,
        trackId,
      },
      include: {
        track: true,
      },
    });

    return NextResponse.json(historyEntry, { status: 201 });
  } catch (error) {
    console.error('Error adding to play history:', error);
    return NextResponse.json(
      { error: 'Failed to add to play history' },
      { status: 500 }
    );
  }
}