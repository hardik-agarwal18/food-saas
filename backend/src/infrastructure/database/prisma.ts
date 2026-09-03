/**
 * Shared Prisma client configuration.
 *
 * This file creates the application's Prisma client.
 *
 * Responsibilities:
 * - Read the database connection string from environment configuration
 * - Create the PostgreSQL adapter
 * - Create the Prisma client
 * - Configure Prisma logging
 * - Export the shared Prisma instance
 *
 * Why this exists:
 * The application should use one shared Prisma client instead of
 * creating a new database client in every repository or service.
 *
 * The client is registered in the dependency-injection container
 * by infrastructure.ts and can then be injected into services.
 */

import { env } from '../../config/env.config.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

/**
 * Read the database connection string from the centralized
 * environment configuration.
 *
 * The actual value should normally come from DATABASE_URL.
 */
const connectionString = env.DATABASE_URL;

/**
 * Create the PostgreSQL adapter used by Prisma.
 *
 * The adapter connects Prisma's database operations to PostgreSQL.
 */
const adapter = new PrismaPg({
  connectionString,
});

/**
 * Create the shared Prisma client.
 *
 * Query events are emitted as events so that query-logger.ts
 * can subscribe to them and forward them to the application logger.
 *
 * Warnings and errors are written to stdout.
 */
const prisma = new PrismaClient({
  adapter,
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
  ],
});

/**
 * Export the shared Prisma client.
 *
 * Other infrastructure files can import this instance rather than
 * creating another PrismaClient.
 */
export { prisma };
