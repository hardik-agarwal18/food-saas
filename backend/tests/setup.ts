/**
 * Global Vitest setup for integration tests.
 *
 * Connects to the test database before the suite, clears test data before
 * each test, and disconnects from the database after the suite completes.
 */

import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

import { afterAll, beforeAll, beforeEach } from 'vitest';

import {
  cleanTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from './helpers/test.database.js';

/**
 * Runs once before any tests in the current file are executed.
 * 
 * Establishes a persistent connection to the PostgreSQL test database,
 * preventing connection overhead from slowing down individual tests.
 */
beforeAll(async () => {
  await connectTestDatabase();
});

/**
 * Runs before each individual test inside the current file.
 * 
 * Clears the database state to ensure that every test starts with a clean
 * slate. This guarantees test isolation and prevents side effects from 
 * bleeding across test cases.
 */
beforeEach(async () => {
  await cleanTestDatabase();
});

/**
 * Runs once after all tests in the current file have finished executing.
 * 
 * Gracefully closes the Prisma connection pool to the test database,
 * ensuring no dangling connections remain that could hang the test runner.
 */
afterAll(async () => {
  await disconnectTestDatabase();
});
