/**
 * Shared Prisma client and database lifecycle helpers for integration tests.
 *
 * The client is created lazily and reused across test files. It is configured
 * with the test-database connection string from the application environment.
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/generated/prisma/client.js';

let prisma: PrismaClient | null = null;

/**
 * Returns the shared Prisma client, creating it when necessary.
 *
 * @returns The Prisma client configured for the test database.
 */
export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    const adapter = new PrismaPg({
      connectionString: process.env.TEST_DATABASE_URL,
    });
    if (!process.env.TEST_DATABASE_URL) {
      throw new Error('TEST_DATABASE_URL is not set');
    }
    prisma = new PrismaClient({
      adapter,
    });
  }

  return prisma;
};

/**
 * Opens the shared test-database connection.
 */
export const connectTestDatabase = async (): Promise<void> => {
  const client = getPrismaClient();

  await client.$connect();
};

/**
 * Closes the shared test-database connection and clears the cached client.
 */
export const disconnectTestDatabase = async (): Promise<void> => {
  if (!prisma) {
    return;
  }

  await prisma.$disconnect();

  prisma = null;
};

/**
 * Removes data created by integration tests.
 *
 * Dependent records are deleted before parent records to satisfy foreign-key
 * constraints. The cleanup runs in a single transaction.
 */
export const cleanTestDatabase = async (): Promise<void> => {
  const client = getPrismaClient();

  await client.$transaction([
    client.passwordReset.deleteMany(),
    client.emailVerification.deleteMany(),
    client.refreshSession.deleteMany(),
    client.user.deleteMany(),
  ]);
};
