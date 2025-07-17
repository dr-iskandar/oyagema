import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const playlists = await prisma.playlist.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tracks: {
          include: {
            track: true,
          },
        },
      },
    });

    // Transform the data to include track count and simplify the structure
    const formattedPlaylists = playlists.map((playlist) => ({
      id: playlist.id,
      title: playlist.title,
      description: playlist.description,
      coverUrl: playlist.coverUrl,
      userId: playlist.userId,
      userName: playlist.user.name,
      userImage: playlist.user.image,
      trackCount: playlist.tracks.length,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
    }));

    return NextResponse.json(formattedPlaylists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, coverUrl, userId, trackIds } = body;

    // Validate required fields
    if (!title || !userId) {
      return NextResponse.json(
        { error: 'Title and userId are required' },
        { status: 400 }
      );
    }

    // Create the playlist
    const playlist = await prisma.playlist.create({
      data: {
        title,
        description,
        coverUrl,
        userId,
      },
    });

    // Add tracks to the playlist if provided
    if (trackIds && trackIds.length > 0) {
      await Promise.all(
        trackIds.map((trackId: string) =>
          prisma.playlistTrack.create({
            data: {
              playlistId: playlist.id,
              trackId,
            },
          })
        )
      );
    }

    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    );
  }
}