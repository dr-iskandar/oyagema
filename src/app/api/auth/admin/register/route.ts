import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hash } from 'bcrypt';

// Admin key untuk validasi - dalam production sebaiknya disimpan di environment variable
const ADMIN_KEY = process.env.ADMIN_REGISTRATION_KEY || 'oyagema-admin-2024';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, adminKey } = body;

    console.log('Admin registration API called with email:', email);

    // Validate required fields
    if (!name || !email || !password || !adminKey) {
      console.log('Admin registration failed: All fields are required');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate admin key
    if (adminKey !== ADMIN_KEY) {
      console.log('Admin registration failed: Invalid admin key');
      return NextResponse.json(
        { error: 'Invalid admin key. Contact system administrator.' },
        { status: 403 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Admin registration failed: Invalid email format');
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('Admin registration failed: Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Admin registration failed: User already exists with email:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN', // Set role as ADMIN
      },
    });

    console.log('Admin registration successful for email:', email);

    // Return success response (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      message: 'Admin registration successful',
      user: userWithoutPassword,
    }, { status: 201 });
  } catch (error) {
    console.error('Admin registration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}