/**
 * Prisma query logging integration.
 *
 * This file connects Prisma's query event system to the application's
 * ILogger abstraction.
 *
 * Responsibilities:
 * - Register a listener for Prisma query events
 * - Log executed database queries
 * - Include query duration and parameters
 * - Prevent duplicate listener registration
 *
 * Why this exists:
 * Prisma can emit query events, but the application uses its own
 * logging abstraction. This file acts as the bridge between them.
 */

import { ILogger } from '../../shared/logger/logger.interface.js';
import { InfrastructureTokens } from '../container/index.js';
import { prisma } from './prisma.js';
import { container } from 'tsyringe';

/**
 * Prevents the same Prisma query listener from being registered
 * multiple times.
 *
 * Without this guard, calling registerQueryLogger() repeatedly
 * would add multiple listeners and cause duplicate log messages.
 */
let isRegistered = false;

/**
 * Registers the Prisma query-event listener.
 *
 * The function is safe to call multiple times because it returns
 * immediately after the first successful registration.
 */
export const registerQueryLogger = (): void => {
  /**
   * Do not register the same listener more than once.
   */
  if (isRegistered) {
    return;
  }

  /**
   * Resolve the application logger from the DI container.
   */
  const logger = container.resolve<ILogger>(InfrastructureTokens.Logger);

  /**
   * Subscribe to Prisma query events.
   *
   * The callback runs whenever Prisma emits a query event.
   */
  prisma.$on('query', (event) => {
    /**
     * Log the query as structured metadata.
     *
     * The event contains:
     * - query: SQL query text
     * - duration: query execution time
     * - params: query parameters
     */
    logger.debug('Database Query Executed', {
      component: 'Database',
      query: event.query,
      duration: event.duration,
      params: event.params,
    });
  });

  /**
   * Mark the listener as registered.
   *
   * Future calls will not attach another listener.
   */
  isRegistered = true;
};
