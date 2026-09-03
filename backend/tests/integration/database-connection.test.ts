/**
 * Smoke test for the PostgreSQL test-database connection.
 *
 * This verifies that Prisma can execute a basic query against the configured
 * test database. Repository behavior is covered by separate integration tests.
 */
import { describe, expect, it } from 'vitest';
import { getPrismaClient } from '../helpers/test.database.js';

/**
 * Shared Prisma client instance configured for the test database.
 */
const prisma = getPrismaClient();

/**
 * Database connection test suite.
 * 
 * Ensures that the testing environment can properly communicate with the 
 * underlying PostgreSQL database before running complex integration tests.
 */
describe('Test PostgreSQL', () => {
  /**
   * Verifies basic connectivity and query execution.
   * 
   * This executes a raw SQL query `SELECT 1` which is the standard way to 
   * ping a PostgreSQL database to verify connection health.
   */
  it('should connect to the test database', async () => {
    const result = await prisma.$queryRaw<Array<{ result: number }>>`
      SELECT 1 AS result
    `;

    // The result should contain exactly one row with { result: 1 }
    expect(result[0]?.result).toBe(1);
  });
});
