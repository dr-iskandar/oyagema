import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const tracks = await prisma.track.findMany({
      include: {
        category: true,
      },
    });

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, artist, description, coverUrl, audioUrl, duration, categoryId } = body;

    // Validate required fields
    if (!title || !artist || !coverUrl || !audioUrl || !duration || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Create new track
    const track = await prisma.track.create({
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

    return NextResponse.json(track, { status: 201 });
  } catch (error) {
    console.error('Error creating track:', error);
    return NextResponse.json(
      { error: 'Failed to create track' },
      { status: 500 }
    );
  }
}