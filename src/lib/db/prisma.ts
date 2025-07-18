import { PrismaClient } from '@prisma/client';
import { shouldSkipDbOperations } from './config';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

// Export a wrapped version of the Prisma client that checks if DB operations should be skipped
export const db = {
  ...prisma,
  // Add methods to check if operations should be skipped
  isSkipped: shouldSkipDbOperations,
};

export default db;