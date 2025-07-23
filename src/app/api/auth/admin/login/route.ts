import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { compare } from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Admin login API called with email:', email);

    // Validate required fields
    if (!email || !password) {
      console.log('Admin login failed: Email and password are required');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('Admin login failed: User not found for email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (user.role !== 'ADMIN') {
      console.log('Admin login failed: User is not an admin:', email);
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Admin login failed: Invalid password for email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Admin login successful for email:', email);

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    void _; // Explicitly mark as intentionally unused
    
    return NextResponse.json({
      message: 'Admin login successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Admin login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}