import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const track = await prisma.track.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(track);
  } catch (error) {
    console.error('Error fetching track:', error);
    return NextResponse.json(
      { error: 'Failed to fetch track' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, artist, description, coverUrl, audioUrl, duration, categoryId } = body;

    // Check if track exists
    const trackExists = await prisma.track.findUnique({
      where: { id },
    });

    if (!trackExists) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    // Check if category exists if categoryId is provided
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!categoryExists) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    // Update track
    const updatedTrack = await prisma.track.update({
      where: { id },
      data: {
        title,
        artist,
        description,
        coverUrl,
        audioUrl,
        duration,
        categoryId,
      },
    });

    return NextResponse.json(updatedTrack);
  } catch (error) {
    console.error('Error updating track:', error);
    return NextResponse.json(
      { error: 'Failed to update track' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Check if track exists
    const trackExists = await prisma.track.findUnique({
      where: { id },
    });

    if (!trackExists) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    // Delete track
    await prisma.track.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Track deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting track:', error);
    return NextResponse.json(
      { error: 'Failed to delete track' },
      { status: 500 }
    );
  }
}