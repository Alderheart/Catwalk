import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

declare global {
  var prisma: PrismaClient | undefined;
}

// Serverless-optimized Prisma client
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Use Prisma Accelerate for connection pooling if available
  if (process.env.PRISMA_ACCELERATE_URL) {
    return client.$extends(withAccelerate());
  }

  return client;
};

// Use global variable in development to prevent multiple instances
const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Graceful shutdown
const gracefulShutdown = async () => {
  await prisma.$disconnect();
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export { prisma };
export default prisma;