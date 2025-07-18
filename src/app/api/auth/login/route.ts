import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { compare } from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login API called with email:', email);

    // Validate required fields
    if (!email || !password) {
      console.log('Login failed: Email and password are required');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      console.log('Login failed: Invalid email or password');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('User found with ID:', user.id);

    // Compare passwords
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      console.log('Login failed: Password does not match');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    void _; // Explicitly mark as intentionally unused
    
    console.log('Login successful, returning user data:', userWithoutPassword);
    
    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}