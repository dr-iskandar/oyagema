import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const count = await prisma.playlist.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting playlists:', error);
    return NextResponse.json(
      { error: 'Failed to count playlists' },
      { status: 500 }
    );
  }
}