/**
 * Application bootstrap file.
 *
 * This file prepares external infrastructure dependencies before
 * the HTTP server starts accepting requests.
 *
 * Responsibilities:
 * - Resolve the application logger
 * - Connect to the database
 * - Connect to Redis
 * - Log startup progress
 *
 * This file does not create the Express server.
 * Server creation is handled separately by server.ts.
 *
 * Startup sequence:
 *
 * main.ts
 *   → bootstrap()
 *       → Database connection
 *       → Redis connection
 *   → createServer()
 */

import { container } from 'tsyringe';

import { DatabaseService } from '../infrastructure/database/database.service.js';
import { RedisService } from '../infrastructure/cache/redis.service.js';
import { ILogger } from '../shared/logger/logger.interface.js';
import { InfrastructureTokens } from '../infrastructure/container/tokens/infrastructure.tokens.js';

/**
 * Initializes the infrastructure required by the application.
 *
 * The function returns only after the database and Redis connection
 * methods have completed.
 *
 * If either connection method throws an error, the error is passed
 * back to the caller, usually main.ts, which can terminate startup.
 */
export const bootstrap = async (): Promise<void> => {
  /**
   * Resolve the logger through its interface token.
   *
   * The application depends on ILogger rather than directly depending
   * on a specific logger implementation.
   */
  const logger = container.resolve<ILogger>(InfrastructureTokens.Logger);

  logger.info('Bootstrapping application...');

  /**
   * Resolve the infrastructure services from the dependency
   * injection container.
   */
  const databaseService = container.resolve(DatabaseService);
  const redisService = container.resolve(RedisService);

  /**
   * Connect to the database before starting the HTTP server.
   *
   * This prevents the application from accepting requests while
   * the database is unavailable.
   */
  await databaseService.connectToDatabase();

  /**
   * Connect to Redis before starting the HTTP server.
   *
   * Redis may be required for caching, sessions, rate limiting,
   * queues, or other infrastructure features.
   */
  await redisService.connectToRedis();

  logger.info('Application bootstrapped successfully');
};
