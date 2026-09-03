/**
 * Database connection and health service.
 *
 * This class manages the application's shared Prisma client.
 *
 * Responsibilities:
 * - Connect to the database
 * - Disconnect from the database
 * - Check database health
 * - Expose the Prisma client when required
 * - Register database query logging
 *
 * This service does not contain repository-specific business logic.
 * Repositories are responsible for reading and writing domain data.
 */

import { inject, injectable } from 'tsyringe';

import { InfrastructureTokens } from '../container/tokens/infrastructure.tokens.js';
import { registerQueryLogger } from './query-logger.js';

import type { PrismaClient } from '../../generated/prisma/client.js';
import type { ILogger } from '../../shared/logger/logger.interface.js';

import { LoggerFactory } from '../observability/logger/logger.factory.js';

/**
 * Provides database connection management and health checks.
 *
 * The class is injectable because its dependencies are supplied
 * by the tsyringe dependency-injection container.
 */
@injectable()
export class DatabaseService {
  constructor(
    /**
     * Shared Prisma client.
     *
     * It is registered in the DI container using
     * InfrastructureTokens.PrismaClient.
     */
    @inject(InfrastructureTokens.PrismaClient)
    private readonly prisma: PrismaClient,

    /**
     * Application logger.
     *
     * This dependency is initially injected through the Logger token.
     */
    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,

    /**
     * LoggerFactory creates a child logger with component metadata.
     */
    loggerFactory: LoggerFactory,
  ) {
    /**
     * Replace the injected logger with a child logger that identifies
     * database-related log messages.
     *
     * The child logger automatically includes:
     * - component: Database
     * - module: Infrastructure
     */
    this.logger = loggerFactory.create({
      component: 'Database',
      module: 'Infrastructure',
    });
  }

  /**
   * Establishes a connection to the database.
   *
   * This method is called during application startup by bootstrap.ts.
   *
   * It also registers the Prisma query-event listener before connecting.
   *
   * @throws Re-throws the connection error if the connection fails.
   */
  async connectToDatabase(): Promise<void> {
    try {
      this.logger.info('Connecting to the database...', {
        event: 'CONNECTING_DATABASE',
        component: 'Database',
        module: 'Infrastructure',
      });

      /**
       * Connect Prisma query events to the application logger.
       *
       * The query logger listens for Prisma query events and writes
       * structured debug logs.
       */
      registerQueryLogger();

      /**
       * Establish the actual database connection.
       */
      await this.prisma.$connect();

      this.logger.info('Successfully connected to the database.');
    } catch (error) {
      /**
       * Log the failure at fatal level because the application cannot
       * safely start if the database connection is required.
       */
      this.logger.fatal('Failed to connect to the database.', error);

      /**
       * Re-throw the error so bootstrap.ts or main.ts can handle it.
       */
      throw error;
    }
  }

  /**
   * Disconnects from the database.
   *
   * This method is called during graceful application shutdown.
   *
   * If disconnection fails, the error is logged but is not re-thrown.
   */
  async disconnectFromDatabase(): Promise<void> {
    try {
      this.logger.info('Disconnecting from the database...', {
        event: 'DISCONNECTING_DATABASE',
        component: 'Database',
        module: 'Infrastructure',
      });

      /**
       * Close the Prisma database connection.
       */
      await this.prisma.$disconnect();

      this.logger.info('Successfully disconnected from the database.');
    } catch (error) {
      /**
       * Log the failure during shutdown.
       */
      this.logger.fatal('Failed to disconnect from the database.', error);
    }
  }

  /**
   * Checks whether the database is reachable and responding.
   *
   * The query SELECT 1 is a lightweight query that does not depend
   * on any application table.
   *
   * @returns An object containing the health status and query latency.
   *
   * Healthy response:
   * {
   *   status: 'healthy',
   *   latency: number
   * }
   *
   * Unhealthy response:
   * {
   *   status: 'unhealthy'
   * }
   */
  async checkDatabaseHealth() {
    try {
      /**
       * Record the start time using a high-resolution timer.
       */
      const startedAt = process.hrtime.bigint();

      /**
       * Execute a simple database query.
       *
       * If this query succeeds, the database is reachable.
       */
      await this.prisma.$queryRaw`SELECT 1`;

      /**
       * Calculate elapsed time in milliseconds.
       *
       * process.hrtime.bigint() returns nanoseconds.
       * Dividing by 1,000,000 converts nanoseconds to milliseconds.
       */
      const latency = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      /**
       * A failed health query means the database is currently
       * unavailable or unable to respond.
       */
      this.logger.error('Database health check failed', error);

      return {
        status: 'unhealthy',
      };
    }
  }

  /**
   * Returns the underlying Prisma client.
   *
   * This should be used carefully because it exposes the low-level
   * database client to the caller.
   *
   * Repositories may use the client for database operations.
   */
  public getClient = (): PrismaClient => {
    return this.prisma;
  };
}
