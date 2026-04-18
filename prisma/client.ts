// prisma/client.ts

import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 2000,
});

neonPool.on('error', (err) => {
  if (err.message.includes('SASL')) {
    console.error('Neon SASL error detected. Resetting connection pool...');
    neonPool.end();
  }
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;