import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Get all playlists with user and track count information (admin only)
export async function GET() {
  try {
    const playlists = await prisma.playlist.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tracks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}