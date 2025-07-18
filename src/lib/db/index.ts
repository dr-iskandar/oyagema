import { PrismaClient } from '@prisma/client';
import { shouldSkipDbOperations } from './config';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a mock Prisma client for build time
const createMockPrismaClient = () => {
  return {
    track: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      count: () => Promise.resolve(0),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
      upsert: () => Promise.resolve({}),
    },
    category: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      count: () => Promise.resolve(0),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
      upsert: () => Promise.resolve({}),
    },
    user: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      count: () => Promise.resolve(0),
      create: (data: { name?: string; email?: string; password?: string; role?: string }) => Promise.resolve({
        id: 'mock-user-id',
        name: data?.name || 'Mock User',
        email: data?.email || 'mock@example.com',
        password: data?.password || 'mock-password',
        role: data?.role || 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
      upsert: () => Promise.resolve({}),
    },

    history: {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      count: () => Promise.resolve(0),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
      upsert: () => Promise.resolve({}),
    },
    $queryRaw: () => Promise.resolve([]),
  };
};

// Determine if we should use the real Prisma client or a mock
let prismaClient;
if (shouldSkipDbOperations()) {
  console.log('Using mock Prisma client for build');
  prismaClient = createMockPrismaClient();
} else {
  prismaClient = globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;
}

export const prisma = prismaClient;