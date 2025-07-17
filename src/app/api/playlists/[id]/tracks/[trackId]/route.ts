import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Remove a track from a playlist
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; trackId: string } }
) {
  try {
    const { id: playlistId, trackId } = params;

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

    // Check if track is in the playlist
    const playlistTrack = await prisma.playlistTrack.findUnique({
      where: {
        playlistId_trackId: {
          playlistId,
          trackId,
        },
      },
    });

    if (!playlistTrack) {
      return NextResponse.json(
        { error: 'Track not found in the playlist' },
        { status: 404 }
      );
    }

    // Remove track from playlist
    await prisma.playlistTrack.delete({
      where: {
        playlistId_trackId: {
          playlistId,
          trackId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error removing track ${params.trackId} from playlist ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to remove track from playlist' },
      { status: 500 }
    );
  }
}