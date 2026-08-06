// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { logger } from '../shared/utils/logger/logger';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a Prisma adapter using the pool
const adapter = new PrismaPg(pool);

// Create PrismaClient with the adapter
export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end(); // Close the PostgreSQL pool
  logger.info('Prisma disconnected and pool closed');
});

prisma.$on('error', (error) => {
  logger.error('Prisma error:', error);
});