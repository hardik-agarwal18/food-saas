/**
 * Shared Prisma client and database lifecycle helpers for integration tests.
 *
 * The client is created lazily and reused across test files. It is configured
 * with the test-database connection string from the application environment.
 */

import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;
import { PrismaClient } from '../../src/generated/prisma/client.js';

let prisma: PrismaClient | null = null;
let pool: pkg.Pool | null = null;

/**
 * Returns the shared Prisma client, creating it when necessary.
 *
 * @returns The Prisma client configured for the test database.
 */
export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    if (!process.env.TEST_DATABASE_URL) {
      throw new Error('TEST_DATABASE_URL is not set');
    }
    pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL, max: 10 });
    const adapter = new PrismaPg(pool);
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
  
  if (pool) {
    await pool.end();
    pool = null;
  }

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

  // Delete child records first to satisfy foreign-key constraints
  await client.orderItemModifier.deleteMany();
  await client.orderItem.deleteMany();
  await client.orderStatusHistory.deleteMany();
  await client.deliveryAssignment.deleteMany();
  await client.order.deleteMany();

  await client.menuItemToModifierGroup.deleteMany();
  await client.menuModifierItem.deleteMany();
  await client.menuModifierGroup.deleteMany();
  await client.menuItem.deleteMany();
  await client.menuCategory.deleteMany();
  await client.restaurant.deleteMany();

  await client.driver.deleteMany();
  await client.customer.deleteMany();

  await client.passwordReset.deleteMany();
  await client.emailVerification.deleteMany();
  await client.refreshSession.deleteMany();
  await client.outboxEvent.deleteMany();

  // Finally, delete the parent User table
  await client.user.deleteMany();
};
