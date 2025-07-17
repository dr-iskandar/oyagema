import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Remove a track from favorites
export async function DELETE(
  request: Request,
  { params }: { params: { trackId: string } }
) {
  try {
    const { trackId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if favorite exists
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    // Remove from favorites
    await prisma.favorite.delete({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error removing track ${params.trackId} from favorites:`, error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}

// Check if a track is in favorites
export async function GET(
  request: Request,
  { params }: { params: { trackId: string } }
) {
  try {
    const { trackId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if favorite exists
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_trackId: {
          userId,
          trackId,
        },
      },
    });

    return NextResponse.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error(`Error checking favorite status for track ${params.trackId}:`, error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}