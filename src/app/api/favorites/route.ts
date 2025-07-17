import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Get all favorites for a user
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

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        track: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response
    const formattedFavorites = favorites.map((favorite) => ({
      id: favorite.id,
      trackId: favorite.trackId,
      title: favorite.track.title,
      artist: favorite.track.artist,
      coverUrl: favorite.track.coverUrl,
      audioUrl: favorite.track.audioUrl,
      duration: favorite.track.duration,
      createdAt: favorite.createdAt,
    }));

    return NextResponse.json(formattedFavorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// Add a track to favorites
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

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Track already in favorites' },
        { status: 400 }
      );
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        trackId,
      },
      include: {
        track: true,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}