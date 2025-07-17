import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminId } = body;

    console.log('Admin verification API called with adminId:', adminId);

    // Validate required fields
    if (!adminId) {
      console.log('Admin verification failed: Admin ID is required');
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.log('Admin verification failed: User not found for ID:', adminId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has admin role
    if (user.role !== 'ADMIN') {
      console.log('Admin verification failed: User is not an admin:', adminId);
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    console.log('Admin verification successful for ID:', adminId);

    return NextResponse.json({
      message: 'Admin verification successful',
      user,
    });
  } catch (error) {
    console.error('Admin verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}