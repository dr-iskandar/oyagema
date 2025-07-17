import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const count = await prisma.category.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting categories:', error);
    return NextResponse.json(
      { error: 'Failed to count categories' },
      { status: 500 }
    );
  }
}