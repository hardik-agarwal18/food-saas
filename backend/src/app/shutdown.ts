/**
 * Graceful shutdown file.
 *
 * This file closes the application safely when the process receives
 * a shutdown signal.
 *
 * Expected shutdown sequence:
 *
 * 1. Receive SIGINT or SIGTERM
 * 2. Log the shutdown signal
 * 3. Stop accepting new HTTP connections
 * 4. Wait for the HTTP server to close
 * 5. Disconnect from the database
 * 6. Disconnect from Redis
 * 7. Exit the process
 *
 * Graceful shutdown prevents the application from terminating
 * while requests or infrastructure operations are still running.
 */

import { container } from 'tsyringe';
import { Server } from 'http';
import { DatabaseService } from '../infrastructure/database/database.service.js';
import { RedisService } from '../infrastructure/cache/redis.service.js';
import { InfrastructureTokens } from '../infrastructure/container/tokens/infrastructure.tokens.js';
import type { ILogger } from '../shared/logger/logger.interface.js';

/**
 * Shuts down the application gracefully.
 *
 * @param server - The HTTP server created by createServer()
 * @param signal - The operating-system signal that triggered shutdown
 *
 * Common signals:
 * - SIGINT: Usually generated when pressing Ctrl+C
 * - SIGTERM: Commonly sent by Docker, Kubernetes, or a process manager
 */
export const shutdown = (server: Server, signal: string): void => {
  const logger = container.resolve<ILogger>(InfrastructureTokens.Logger);

  logger.info(`${signal} received. Shutting down gracefully...`);

  /**
   * Stop accepting new HTTP connections.
   *
   * The callback is executed after the existing HTTP connections
   * have been closed.
   */
  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      const databaseService = container.resolve(DatabaseService);
      const redisService = container.resolve(RedisService);

      await databaseService.disconnectFromDatabase();
      await redisService.disconnectFromRedis();

      process.exit(0);
    } catch (error) {
      logger.error('Error in shutting down the server', error);
      process.exit(1); // Exit the process with a failure code
    }
  });
};
