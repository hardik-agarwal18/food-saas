import { inject, injectable } from 'tsyringe';
import { InfrastructureTokens } from '../container/index.js';

import type { ILogger } from '../../shared/logger/logger.interface.js';
import type { Redis } from 'ioredis';

/**
 * Manages the Redis connection lifecycle.
 *
 * This service is responsible for:
 * - Connecting to Redis during application startup.
 * - Disconnecting from Redis during application shutdown.
 * - Checking whether Redis is reachable.
 *
 * It does not contain cache-specific operations such as
 * get, set, delete, or increment. Those operations belong
 * to CacheService.
 */
@injectable()
export class RedisService {
  constructor(
    /**
     * Shared Redis client resolved through the DI container.
     */
    @inject(InfrastructureTokens.RedisClient)
    private readonly redis: Redis,

    /**
     * Application logger used for lifecycle and health logs.
     */
    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  /**
   * Establishes the Redis connection.
   *
   * The error is logged and rethrown so that application
   * startup can fail when Redis is required but unavailable.
   */
  async connectToRedis(): Promise<void> {
    try {
      this.logger.info('Connecting to Redis...');

      await this.redis.connect();

      this.logger.info('Connected to Redis successfully');
    } catch (error) {
      this.logger.fatal('Failed to connect to Redis', error);

      /**
       * Rethrowing is important because the caller needs
       * to know that startup was unsuccessful.
       */
      throw error;
    }
  }

  /**
   * Gracefully closes the Redis connection.
   *
   * `quit()` asks Redis to finish pending commands before
   * closing the connection.
   */
  async disconnectFromRedis(): Promise<void> {
    try {
      this.logger.info('Disconnecting from Redis...');

      await this.redis.quit();

      this.logger.info('Disconnected from Redis successfully');
    } catch (error) {
      /**
       * The current implementation logs the failure but
       * does not rethrow it.
       */
      this.logger.fatal('Failed to disconnect from Redis', error);
    }
  }

  /**
   * Checks whether Redis responds to a PING command.
   *
   * The method also measures the response latency in
   * milliseconds.
   */
  async checkRedisHealth() {
    try {
      const startedAt = process.hrtime.bigint();

      await this.redis.ping();

      const latency = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      this.logger.error('Redis health check failed', error);

      return {
        status: 'unhealthy',
      };
    }
  }
}
