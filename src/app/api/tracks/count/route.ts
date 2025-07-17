import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const count = await prisma.track.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting tracks:', error);
    return NextResponse.json(
      { error: 'Failed to count tracks' },
      { status: 500 }
    );
  }
}