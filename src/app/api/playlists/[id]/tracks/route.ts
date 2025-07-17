import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Add a track to a playlist
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: playlistId } = params;
    const { trackId } = await request.json();

    if (!trackId) {
      return NextResponse.json(
        { error: 'Track ID is required' },
        { status: 400 }
      );
    }

    // Check if playlist exists
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
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

    // Check if track is already in the playlist
    const existingEntry = await prisma.playlistTrack.findUnique({
      where: {
        playlistId_trackId: {
          playlistId,
          trackId,
        },
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Track already exists in the playlist' },
        { status: 400 }
      );
    }

    // Add track to playlist
    const playlistTrack = await prisma.playlistTrack.create({
      data: {
        playlistId,
        trackId,
      },
      include: {
        track: true,
      },
    });

    return NextResponse.json(playlistTrack, { status: 201 });
  } catch (error) {
    console.error(`Error adding track to playlist ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to add track to playlist' },
      { status: 500 }
    );
  }
}

// Get all tracks in a playlist
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: playlistId } = params;

    // Check if playlist exists
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Get all tracks in the playlist
    const playlistTracks = await prisma.playlistTrack.findMany({
      where: { playlistId },
      include: {
        track: true,
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    // Format the response
    const tracks = playlistTracks.map((pt) => ({
      id: pt.track.id,
      title: pt.track.title,
      artist: pt.track.artist,
      coverUrl: pt.track.coverUrl,
      audioUrl: pt.track.audioUrl,
      duration: pt.track.duration,
      addedAt: pt.addedAt,
    }));

    return NextResponse.json(tracks);
  } catch (error) {
    console.error(`Error fetching tracks for playlist ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}