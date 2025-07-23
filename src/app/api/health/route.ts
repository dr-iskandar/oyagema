import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

/**
 * Health check endpoint for monitoring application status
 * Used by deployment scripts and monitoring tools
 */
export async function GET() {
  try {
    // Check database connection
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    
    // Return health status
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '0.1.0',
    }, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    // Return unhealthy status
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}