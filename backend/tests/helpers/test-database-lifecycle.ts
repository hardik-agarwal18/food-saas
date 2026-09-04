/**
 * Registers the shared test-database lifecycle hooks.
 *
 * Call setupTestDatabase() from the global test setup file to connect once
 * before the tests and disconnect once after the tests finish.
 */

import { beforeAll, afterAll } from 'vitest';
import { connectTestDatabase, disconnectTestDatabase } from './test.database';

/**
 * Registers Vitest hooks for opening and closing the test database.
 */
export const setupTestDatabase = (): void => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });
};
