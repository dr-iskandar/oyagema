import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
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

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Transform the data to include tracks in a more usable format
    const formattedPlaylist = {
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
      tracks: playlist.tracks.map((pt) => ({
        id: pt.track.id,
        title: pt.track.title,
        artist: pt.track.artist,
        coverUrl: pt.track.coverUrl,
        audioUrl: pt.track.audioUrl,
        duration: pt.track.duration,
        addedAt: pt.addedAt,
      })),
    };

    return NextResponse.json(formattedPlaylist);
  } catch (error) {
    console.error(`Error fetching playlist ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, coverUrl, userId, trackIds } = body;

    // Check if playlist exists
    const existingPlaylist = await prisma.playlist.findUnique({
      where: { id },
    });

    if (!existingPlaylist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // If userId is provided, check if user exists
    if (userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    // Update playlist details
    const updatedPlaylist = await prisma.playlist.update({
      where: { id },
      data: {
        title,
        description,
        coverUrl,
        userId: userId || existingPlaylist.userId, // Update userId if provided
      },
    });

    // If trackIds is provided, update the playlist tracks
    if (trackIds) {
      // Remove all existing tracks
      await prisma.playlistTrack.deleteMany({
        where: { playlistId: id },
      });

      // Add new tracks
      if (trackIds.length > 0) {
        await Promise.all(
          trackIds.map((trackId: string) =>
            prisma.playlistTrack.create({
              data: {
                playlistId: id,
                trackId,
              },
            })
          )
        );
      }
    }

    return NextResponse.json(updatedPlaylist);
  } catch (error) {
    console.error(`Error updating playlist ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update playlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if playlist exists
    const existingPlaylist = await prisma.playlist.findUnique({
      where: { id },
    });

    if (!existingPlaylist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Delete the playlist (cascade will handle related records)
    await prisma.playlist.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting playlist ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    );
  }
}